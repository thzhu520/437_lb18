import { useState } from "react";

interface INameEditorProps {
  initialValue: string;
  imageId: string;
  authToken: string;
  onRename: (newName: string) => void;
}

export function ImageNameEditor({ initialValue, imageId, authToken, onRename }: INameEditorProps) {
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
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ newName: input })
      });

      if (!res.ok) {
        // Handle specific error cases
        if (res.status === 401) {
          throw new Error("You must be logged in to edit images");
        } else if (res.status === 403) {
          throw new Error("You can only edit your own images");
        } else if (res.status === 404) {
          throw new Error("Image not found");
        } else {
          throw new Error("Failed to update image name");
        }
      }
      
      onRename(input);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating image name:", err);
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
          <input 
            disabled={working} 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
          />
        </label>
        <button 
          disabled={working || input.length === 0} 
          onClick={handleSubmitPressed}
        >
          {working ? "Saving..." : "Submit"}
        </button>
        <button 
          disabled={working}
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </button>
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