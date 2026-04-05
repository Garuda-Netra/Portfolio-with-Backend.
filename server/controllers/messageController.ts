import { Request, Response } from 'express';
import Message from '../models/Message';

export async function submitMessage(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, subject, message } = req.body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const created = await Message.create({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim()
    });

    res.status(201).json({ message: 'Message submitted successfully', id: created._id });
  } catch {
    res.status(500).json({ error: 'Failed to submit message' });
  }
}

export async function getAllMessages(req: Request, res: Response): Promise<void> {
  try {
    const limit = Number(req.query.limit ?? 0);
    const query = Message.find({ isArchived: false }).sort({ timestamp: -1 });

    if (!Number.isNaN(limit) && limit > 0) {
      query.limit(limit);
    }

    const messages = await query;
    res.json({ messages });
  } catch {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

export async function getMessageById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const message = await Message.findOneAndUpdate(
      { _id: id, isArchived: false },
      { isRead: true },
      { new: true }
    );

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    res.json({ message });
  } catch {
    res.status(500).json({ error: 'Failed to fetch message' });
  }
}

export async function toggleStar(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const message = await Message.findOne({ _id: id, isArchived: false });

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    message.isStarred = !message.isStarred;
    await message.save();

    res.json({ message: 'Star status updated', isStarred: message.isStarred });
  } catch {
    res.status(500).json({ error: 'Failed to toggle star status' });
  }
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const message = await Message.findOneAndUpdate(
      { _id: id, isArchived: false },
      { isRead: true },
      { new: true }
    );

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    res.json({ message: 'Message marked as read' });
  } catch {
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
}

export async function deleteMessage(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const message = await Message.findOneAndUpdate(
      { _id: id, isArchived: false },
      { isArchived: true },
      { new: true }
    );

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    res.json({ message: 'Message archived successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete message' });
  }
}

export async function getUnreadCount(_req: Request, res: Response): Promise<void> {
  try {
    const count = await Message.countDocuments({ isRead: false, isArchived: false });
    res.json({ count });
  } catch {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
}
