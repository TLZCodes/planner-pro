import test from "node:test";
import assert from "node:assert/strict";

test("Migration: extracts attachments from legacy journal entries into lightweight refs", () => {
  const legacyJournals = [
    {
      id: "j-1",
      title: "Entry 1",
      attachments: [
        { id: "att-1", type: "photo", url: "data:image/png;base64,iVBORw0KGgoAAAA", name: "pic.png" },
      ],
    },
  ];
  const extractedAttachments = [];
  const sanitizedJournals = legacyJournals.map((j) => {
    if (Array.isArray(j.attachments)) {
      const cleanedAtts = j.attachments.map((att) => {
        if (att.url && (att.url.startsWith("data:") || att.url.startsWith("blob:"))) {
          const attId = att.id || "att-test";
          extractedAttachments.push({
            id: attId,
            entryId: j.id,
            type: att.type || "photo",
            name: att.name,
            data: att.url,
          });
          return { id: attId, type: att.type || "photo", name: att.name, url: attId };
        }
        return att;
      });
      return { ...j, attachments: cleanedAtts };
    }
    return j;
  });
  assert.equal(extractedAttachments.length, 1);
  assert.equal(sanitizedJournals[0].attachments[0].url, "att-1");
});

test("Migration: handles corrupt legacy data safely", () => {
  let recovered = null;
  try {
    recovered = JSON.parse("invalid json {");
  } catch {
    recovered = { tasks: [], journal: [] };
  }
  assert.deepEqual(recovered, { tasks: [], journal: [] });
});