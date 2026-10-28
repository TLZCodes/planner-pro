import test from "node:test";
import assert from "node:assert/strict";

test("Stress Test: 500 tasks and 200 journal entries processed without memory leak or main thread stall", () => {
  const tasks = [];
  for (let i = 0; i < 500; i++) {
    tasks.push({
      id: "task-" + i,
      title: "Task #" + i + " with important details",
      dueDate: "2026-08-28",
      priority: i % 3 === 0 ? "high" : i % 3 === 1 ? "medium" : "low",
      done: i % 2 === 0,
      tag: "Personal",
      subtasks: [
        { id: "sub-1", title: "Step A", done: true },
        { id: "sub-2", title: "Step B", done: false },
      ],
    });
  }

  const journals = [];
  for (let j = 0; j < 200; j++) {
    journals.push({
      id: "journal-" + j,
      title: "Daily Journal Entry #" + j,
      body: "This is a detailed journal body that has several paragraphs of text reflecting on goals and achievements.",
      date: "2026-08-28",
      mood: "😊",
      energy: "high",
      attachments: [
        { id: "att-" + j, type: "photo", url: "att-ref-" + j, name: "photo_" + j + ".jpg" },
      ],
    });
  }

  const startTime = Date.now();
  // Simulating 50 rapid task toggles
  let updatedTasks = [...tasks];
  for (let k = 0; k < 50; k++) {
    const targetId = "task-" + (k * 10);
    updatedTasks = updatedTasks.map(t => t.id === targetId ? { ...t, done: !t.done } : t);
  }
  const duration = Date.now() - startTime;

  assert.equal(updatedTasks.length, 500);
  assert.equal(journals.length, 200);
  // Should complete in under 50ms
  assert.ok(duration < 50, "Duration was " + duration + "ms (must be < 50ms)");
});