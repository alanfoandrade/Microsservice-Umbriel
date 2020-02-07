import mongoose from 'mongoose';
import { Readable } from 'stream';

import ImportContactService from '@services/ImportContactService';

import Contact from '@schemas/Contact';
import Tag from '@schemas/Tag';

describe('Import', () => {
  beforeAll(async () => {
    if (!process.env.MONGO_URL) {
      throw new Error('MongoDB server not initialized');
    }

    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Contact.deleteMany({});
  });

  it('should be able to import new contacts', async () => {
    const contactsFileStream = Readable.from([
      'alaninatel@gmail.com',
      'email.registro@gmail.com',
      'alanfrank@gec.inatel.br',
    ]);

    const importContacts = new ImportContactService();

    await importContacts.run(contactsFileStream, ['Students', 'Class A']);

    const createdTags = await Tag.find({});

    expect(createdTags).toEqual([
      expect.objectContaining({ title: 'Students' }),
      expect.objectContaining({ title: 'Class A' }),
    ]);

    const createdTagsIds = createdTags.map(tag => tag._id);

    const createdContacts = await Contact.find({});

    expect(createdContacts).toEqual([
      expect.objectContaining({
        email: 'alaninatel@gmail.com',
        tags: createdTagsIds,
      }),
      expect.objectContaining({
        email: 'email.registro@gmail.com',
        tags: createdTagsIds,
      }),
      expect.objectContaining({
        email: 'alanfrank@gec.inatel.br',
        tags: createdTagsIds,
      }),
    ]);
  });
});
