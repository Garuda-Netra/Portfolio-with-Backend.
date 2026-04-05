import { Request, Response } from 'express';
import Analytics from '../models/Analytics';

type IncomingEvent = {
  eventType?: string;
  eventData?: Record<string, unknown>;
  sessionId?: string;
  device?: string;
  browser?: string;
  timestamp?: string;
};

function toRecord(event: IncomingEvent) {
  return {
    eventType: (event.eventType ?? '').trim(),
    eventData: event.eventData ?? {},
    sessionId: (event.sessionId ?? '').trim(),
    device: (event.device ?? '').trim(),
    browser: (event.browser ?? '').trim(),
    timestamp: event.timestamp ? new Date(event.timestamp) : new Date()
  };
}

export async function trackEvent(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as { events?: IncomingEvent[] } & IncomingEvent;
    const events = Array.isArray(body.events) ? body.events : [body as IncomingEvent];

    const records = events
      .map(toRecord)
      .filter((item) => item.eventType.length > 0)
      .slice(0, 200);

    if (records.length === 0) {
      res.status(400).json({ error: 'No valid events provided' });
      return;
    }

    await Analytics.insertMany(records, { ordered: false });
    res.status(201).json({ message: 'Events tracked', count: records.length });
  } catch {
    res.status(500).json({ error: 'Failed to track analytics event' });
  }
}

export async function getAnalyticsSummary(_req: Request, res: Response): Promise<void> {
  try {
    const [
      totalPageViews,
      uniqueSessions,
      sectionViewsAgg,
      buttonClicksAgg,
      terminalCommandsAgg,
      ctfFlagsCount,
      resumeDownloads,
      themeSwitches,
      deviceAgg,
      browserAgg
    ] = await Promise.all([
      Analytics.countDocuments({ eventType: 'page_view' }),
      Analytics.distinct('sessionId', { sessionId: { $ne: '' } }).then((rows) => rows.length),
      Analytics.aggregate([
        { $match: { eventType: 'section_view' } },
        { $group: { _id: '$eventData.section', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Analytics.aggregate([
        { $match: { eventType: 'button_click' } },
        { $group: { _id: '$eventData.button', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Analytics.aggregate([
        { $match: { eventType: 'terminal_command' } },
        { $group: { _id: '$eventData.command', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Analytics.countDocuments({ eventType: 'ctf_flag' }),
      Analytics.countDocuments({ eventType: 'resume_download' }),
      Analytics.countDocuments({ eventType: 'theme_switch' }),
      Analytics.aggregate([
        { $group: { _id: '$device', count: { $sum: 1 } } }
      ]),
      Analytics.aggregate([
        { $group: { _id: '$browser', count: { $sum: 1 } } }
      ])
    ]);

    const mapAgg = (rows: Array<{ _id: string; count: number }>) =>
      rows.reduce<Record<string, number>>((acc, row) => {
        if (row._id) acc[row._id] = row.count;
        return acc;
      }, {});

    res.json({
      totalPageViews,
      uniqueSessions,
      sectionViews: mapAgg(sectionViewsAgg as Array<{ _id: string; count: number }>),
      buttonClicks: mapAgg(buttonClicksAgg as Array<{ _id: string; count: number }>),
      terminalCommands: mapAgg(terminalCommandsAgg as Array<{ _id: string; count: number }>),
      ctfFlagsCount,
      resumeDownloads,
      ctfCompletions: ctfFlagsCount,
      themeSwitches,
      deviceBreakdown: mapAgg(deviceAgg as Array<{ _id: string; count: number }>),
      browserBreakdown: mapAgg(browserAgg as Array<{ _id: string; count: number }>),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
}

export async function getRecentActivity(_req: Request, res: Response): Promise<void> {
  try {
    const events = await Analytics.find({}).sort({ timestamp: -1 }).limit(50);
    res.json({ events });
  } catch {
    res.status(500).json({ error: 'Failed to fetch recent analytics activity' });
  }
}

export async function getAnalyticsByDateRange(req: Request, res: Response): Promise<void> {
  try {
    const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : null;
    const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : null;

    const filter: Record<string, unknown> = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) (filter.timestamp as Record<string, unknown>).$gte = startDate;
      if (endDate) (filter.timestamp as Record<string, unknown>).$lte = endDate;
    }

    const events = await Analytics.find(filter).sort({ timestamp: -1 });
    res.json({ events });
  } catch {
    res.status(500).json({ error: 'Failed to fetch analytics in date range' });
  }
}

export async function clearAnalytics(_req: Request, res: Response): Promise<void> {
  try {
    await Analytics.deleteMany({});
    res.json({ message: 'Analytics cleared successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to clear analytics' });
  }
}
