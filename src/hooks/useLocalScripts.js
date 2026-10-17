import { useEffect, useState } from "react";

const STORAGE_KEY = "promptflow-scripts";

const starterScripts = [
  {
    id: "welcome",
    title: "My introduction",
    content:
      "Hi everyone! Today, I want to talk about my journey, my goals, and the importance of consistency. Every day is an opportunity to learn something new and become a better version of ourselves.",
    updatedAt: Date.now(),
  },
];

export default function useLocalScripts() {
  const [scripts, setScripts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : starterScripts;
    } catch {
      return starterScripts;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts));
  }, [scripts]);

  function saveScript(script) {
    setScripts((current) => {
      const exists = current.some((item) => item.id === script.id);

      return exists
        ? current.map((item) => (item.id === script.id ? script : item))
        : [script, ...current];
    });
  }

  function deleteScript(id) {
    setScripts((current) => current.filter((script) => script.id !== id));
  }

  function createScript() {
    return {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      updatedAt: Date.now(),
    };
  }

  return { scripts, saveScript, deleteScript, createScript };
}
