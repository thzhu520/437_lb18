import { useState } from "react";

interface INameEditorProps {
  initialValue: string;
  imageId: string;
  onRename: (newName: string) => void;
}

export function ImageNameEditor({ initialValue, imageId, onRename }: INameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [input, setInput] = useState(initialValue);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmitPressed() {
    setWorking(true);
    setError(false);
    try {
      const res = await fetch(`/api/images/${imageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ newName: input })
      });

      if (!res.ok) throw new Error();
      onRename(input);
      setIsEditing(false);
    } catch {
      setError(true);
    } finally {
      setWorking(false);
    }
  }

  if (isEditing) {
    return (
      <div style={{ margin: "1em 0" }}>
        <label>
          New Name{" "}
          <input disabled={working} value={input} onChange={(e) => setInput(e.target.value)} />
        </label>
        <button disabled={working || input.length === 0} onClick={handleSubmitPressed}>Submit</button>
        <button onClick={() => setIsEditing(false)}>Cancel</button>
        {working && <p>Working...</p>}
        {error && <p style={{ color: "red" }}>Error submitting name</p>}
      </div>
    );
  }

  return (
    <div style={{ margin: "1em 0" }}>
      <button onClick={() => setIsEditing(true)}>Edit name</button>
    </div>
  );
}
