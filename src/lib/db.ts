import Dexie, { type Table } from 'dexie';

export interface StoredAttachment {
  id: string;
  entryId: string;
  type: 'photo' | 'audio';
  mimeType: string;
  name: string;
  data: string; // Base64 or Blob URL stored in dedicated table
  createdAt: string;
}

export interface MetaRecord {
  key: string;
  value: any;
  updatedAt: string;
}

export class AyxaDatabase extends Dexie {
  tasks!: Table<any, string>;
  journals!: Table<any, string>;
  attachments!: Table<StoredAttachment, string>;
  habits!: Table<any, string>;
  routines!: Table<any, string>;
  goals!: Table<any, string>;
  challenges!: Table<any, string>;
  achievements!: Table<any, string>;
  books!: Table<any, string>;
  trips!: Table<any, string>;
  finances!: Table<any, string>;
  wellness!: Table<any, string>;
  studySessions!: Table<any, string>;
  customCategories!: Table<{ name: string }, string>;
  pixelArt!: Table<any, string>;
  bujoEntries!: Table<any, string>;
  user!: Table<any, string>;
  preferences!: Table<any, string>;
  meta!: Table<MetaRecord, string>;

  constructor() {
    super('AyxaPlannerDB');

    this.version(1).stores({
      tasks: 'id, dueDate, tag, priority, isTopThree, done, createdAt',
      journals: 'id, date, mood, energy, locked, createdAt',
      attachments: 'id, entryId, type, createdAt',
      habits: 'id, category, streak, bestStreak',
      routines: 'id, type',
      goals: 'id, category, targetDate, progress',
      challenges: 'id, status',
      achievements: 'id, unlockedAt',
      books: 'id, status, category',
      trips: 'id, startDate, endDate',
      finances: 'id, date, type, category',
      wellness: 'date',
      studySessions: 'id, subject, date',
      customCategories: 'name',
      pixelArt: 'id, date',
      bujoEntries: 'id, date',
      user: 'id',
      preferences: 'id',
      meta: 'key',
    });
  }
}

export const db = new AyxaDatabase();
