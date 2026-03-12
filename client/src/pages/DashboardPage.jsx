import { useEffect, useMemo, useState } from "react";

import { apiRequest } from "../api.js";
import { useAuth } from "../auth-context.jsx";
import TimelineCard from "../components/TimelineCard.jsx";
import { formatHumanDate, getRelationshipStats, toDateInputValue } from "../utils/date.js";

const emptyMemoryForm = {
  title: "",
  description: "",
  category: "other",
  location: "",
  eventDate: ""
};

export default function DashboardPage() {
  const { token, user, logout, updateProfile } = useAuth();
  const [memories, setMemories] = useState([]);
  const [memoryForm, setMemoryForm] = useState(emptyMemoryForm);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [profileForm, setProfileForm] = useState(() => ({
    displayName: user.displayName,
    partnerName: user.partnerName,
    relationshipStartDate: toDateInputValue(user.relationshipStartDate),
    loveMessageOptIn: user.loveMessageOptIn
  }));
  const [editingMemoryId, setEditingMemoryId] = useState("");
  const [isSavingMemory, setIsSavingMemory] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const stats = useMemo(
    () => getRelationshipStats(user.relationshipStartDate),
    [user.relationshipStartDate]
  );

  useEffect(() => {
    setProfileForm({
      displayName: user.displayName,
      partnerName: user.partnerName,
      relationshipStartDate: toDateInputValue(user.relationshipStartDate),
      loveMessageOptIn: user.loveMessageOptIn
    });
  }, [user]);

  useEffect(() => {
    async function loadMemories() {
      try {
        const response = await apiRequest("/api/memories", {
          token
        });

        setMemories(response.memories);
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    loadMemories();
  }, [token]);

  function resetMemoryEditor() {
    setEditingMemoryId("");
    setMemoryForm(emptyMemoryForm);
    setSelectedFiles([]);
  }

  async function handleMemorySubmit(event) {
    event.preventDefault();
    setIsSavingMemory(true);
    setError("");
    setNotice("");

    const formData = new FormData();
    Object.entries(memoryForm).forEach(([key, value]) => {
      formData.append(key, value);
    });
    selectedFiles.forEach((file) => formData.append("media", file));

    try {
      const response = await apiRequest(
        editingMemoryId ? `/api/memories/${editingMemoryId}` : "/api/memories",
        {
          method: editingMemoryId ? "PUT" : "POST",
          body: formData,
          token
        }
      );

      if (editingMemoryId) {
        setMemories((current) =>
          current
            .map((memory) => (memory._id === editingMemoryId ? response.memory : memory))
            .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
        );
        setNotice("Memory updated.");
      } else {
        setMemories((current) =>
          [...current, response.memory].sort(
            (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
          )
        );
        setNotice("Memory added to your timeline.");
      }

      resetMemoryEditor();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSavingMemory(false);
    }
  }

  async function handleDelete(memoryId) {
    const confirmed = window.confirm("Delete this memory permanently?");

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/api/memories/${memoryId}`, {
        method: "DELETE",
        token
      });

      setMemories((current) => current.filter((memory) => memory._id !== memoryId));
      if (editingMemoryId === memoryId) {
        resetMemoryEditor();
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function handleEdit(memory) {
    setEditingMemoryId(memory._id);
    setSelectedFiles([]);
    setMemoryForm({
      title: memory.title,
      description: memory.description || "",
      category: memory.category || "other",
      location: memory.location || "",
      eventDate: toDateInputValue(memory.eventDate)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setIsSavingProfile(true);
    setError("");
    setNotice("");

    try {
      const updatedUser = await updateProfile(profileForm);
      setProfileForm({
        displayName: updatedUser.displayName,
        partnerName: updatedUser.partnerName,
        relationshipStartDate: toDateInputValue(updatedUser.relationshipStartDate),
        loveMessageOptIn: updatedUser.loveMessageOptIn
      });
      setNotice("Profile updated.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  return (
    <div className="page-shell dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Love dashboard</p>
          <h1>
            {user.displayName} + {user.partnerName}
          </h1>
          <p className="dashboard-subtitle">Your relationship timeline, uploads, reminders, and counters.</p>
        </div>

        <button className="secondary-button" type="button" onClick={logout}>
          Logout
        </button>
      </header>

      <section className="summary-grid">
        <article className="summary-card">
          <p className="eyebrow">Days together</p>
          <h2>{stats.daysTogether}</h2>
          <span>Since {formatHumanDate(user.relationshipStartDate)}</span>
        </article>
        <article className="summary-card">
          <p className="eyebrow">Next anniversary</p>
          <h2>{stats.daysUntilAnniversary} days</h2>
          <span>
            {stats.upcomingYears} year celebration on {stats.nextAnniversaryLabel}
          </span>
        </article>
        <article className="summary-card">
          <p className="eyebrow">Saved memories</p>
          <h2>{memories.length}</h2>
          <span>Photos, videos, trips, birthdays, and milestone moments.</span>
        </article>
      </section>

      {error ? <p className="form-error banner">{error}</p> : null}
      {notice ? <p className="form-notice banner">{notice}</p> : null}

      <section className="dashboard-grid">
        <div className="panel-stack">
          <section className="panel-card">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{editingMemoryId ? "Edit memory" : "Add memory"}</p>
                <h2>{editingMemoryId ? "Update a timeline moment" : "Capture a new chapter"}</h2>
              </div>
              {editingMemoryId ? (
                <button className="ghost-button" type="button" onClick={resetMemoryEditor}>
                  Cancel Edit
                </button>
              ) : null}
            </div>

            <form className="stack-form" onSubmit={handleMemorySubmit}>
              <label>
                Title
                <input
                  required
                  type="text"
                  value={memoryForm.title}
                  onChange={(event) =>
                    setMemoryForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </label>
              <label>
                Memory date
                <input
                  required
                  type="date"
                  value={memoryForm.eventDate}
                  onChange={(event) =>
                    setMemoryForm((current) => ({ ...current, eventDate: event.target.value }))
                  }
                />
              </label>
              <label>
                Category
                <select
                  value={memoryForm.category}
                  onChange={(event) =>
                    setMemoryForm((current) => ({ ...current, category: event.target.value }))
                  }
                >
                  <option value="first-meeting">First meeting</option>
                  <option value="trip">Trip</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="milestone">Milestone</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label>
                Location
                <input
                  type="text"
                  value={memoryForm.location}
                  onChange={(event) =>
                    setMemoryForm((current) => ({ ...current, location: event.target.value }))
                  }
                />
              </label>
              <label>
                Story
                <textarea
                  rows="5"
                  value={memoryForm.description}
                  onChange={(event) =>
                    setMemoryForm((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </label>
              <label>
                Photos or videos
                <input
                  multiple
                  type="file"
                  accept="image/*,video/mp4,video/quicktime,video/webm"
                  onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
                />
              </label>

              {selectedFiles.length ? (
                <p className="muted-copy">{selectedFiles.map((file) => file.name).join(", ")}</p>
              ) : null}

              <button className="primary-button" type="submit" disabled={isSavingMemory}>
                {isSavingMemory
                  ? "Saving..."
                  : editingMemoryId
                    ? "Update Memory"
                    : "Save Memory"}
              </button>
            </form>
          </section>

          <section className="panel-card">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Couple profile</p>
                <h2>Relationship settings</h2>
              </div>
            </div>

            <form className="stack-form" onSubmit={handleProfileSubmit}>
              <label>
                Your name
                <input
                  type="text"
                  value={profileForm.displayName}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, displayName: event.target.value }))
                  }
                />
              </label>
              <label>
                Partner name
                <input
                  type="text"
                  value={profileForm.partnerName}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, partnerName: event.target.value }))
                  }
                />
              </label>
              <label>
                First meeting date
                <input
                  type="date"
                  value={profileForm.relationshipStartDate}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      relationshipStartDate: event.target.value
                    }))
                  }
                />
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={profileForm.loveMessageOptIn}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      loveMessageOptIn: event.target.checked
                    }))
                  }
                />
                Allow scheduled love-message emails
              </label>

              <button className="primary-button" type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? "Saving..." : "Update Profile"}
              </button>
            </form>
          </section>
        </div>

        <section className="panel-card timeline-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Timeline</p>
              <h2>Your saved memories</h2>
            </div>
          </div>

          {memories.length ? (
            <div className="timeline-list">
              {memories.map((memory) => (
                <TimelineCard
                  key={memory._id}
                  memory={memory}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <p className="empty-copy">
              No memories yet. Add your first meeting, a trip, birthday, or anniversary to start
              the timeline.
            </p>
          )}
        </section>
      </section>
    </div>
  );
}
