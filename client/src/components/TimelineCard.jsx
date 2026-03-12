import { formatHumanDate } from "../utils/date.js";

const categoryLabels = {
  "first-meeting": "First Meeting",
  trip: "Trip",
  birthday: "Birthday",
  anniversary: "Anniversary",
  milestone: "Milestone",
  other: "Memory"
};

export default function TimelineCard({ memory, onEdit, onDelete }) {
  return (
    <article className="timeline-card">
      <div className="timeline-date">
        <span>{formatHumanDate(memory.eventDate)}</span>
      </div>

      <div className="timeline-body">
        <div className="timeline-topline">
          <p className="eyebrow">{categoryLabels[memory.category] || "Memory"}</p>
          <div className="timeline-actions">
            <button className="ghost-button" type="button" onClick={() => onEdit(memory)}>
              Edit
            </button>
            <button className="ghost-button danger" type="button" onClick={() => onDelete(memory._id)}>
              Delete
            </button>
          </div>
        </div>

        <h3>{memory.title}</h3>
        {memory.location ? <p className="location-copy">{memory.location}</p> : null}
        {memory.description ? <p className="timeline-description">{memory.description}</p> : null}

        {memory.media?.length ? (
          <div className="media-grid">
            {memory.media.map((item) =>
              item.resourceType === "video" ? (
                <video key={item.url} controls preload="metadata">
                  <source src={item.url} />
                </video>
              ) : (
                <img key={item.url} src={item.url} alt={memory.title} loading="lazy" />
              )
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
