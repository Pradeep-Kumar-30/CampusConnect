import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/apiClient";
import { socket } from "../utils/socket";

const TickerBar = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [notesRes, annsRes] = await Promise.all([
          api.get("/notes"),
          api.get("/announcements"),
        ]);

        const notes = notesRes.data || [];
        const anns = annsRes.data || [];

        const base = [
          {
            text: `Total notes on intranet: ${notes.length}`,
            link: "/notes",
          },
          {
            text: `Total announcements: ${anns.length}`,
            link: "/announcements",
          },
        ];

        const latestAnns = anns.slice(0, 3).map((a) => ({
          text: `Announcement: ${a.title}${
            a.isUrgent ? " (URGENT)" : ""
          } · ${new Date(a.createdAt).toLocaleDateString()}`,
          link: `/announcements/${a._id}`,
        }));

        setItems([...base, ...latestAnns]);
      } catch {
        setItems([]);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const onNewAnnouncement = (ann) => {
      setItems((prev) => [
        {
          text: `New announcement: ${ann.title}${
            ann.isUrgent ? " (URGENT)" : ""
          } · just now`,
          link: `/announcements/${ann._id}`,
        },
        ...prev,
      ]);
    };

    socket.on("newAnnouncement", onNewAnnouncement);
    return () => {
      socket.off("newAnnouncement", onNewAnnouncement);
    };
  }, []);

  if (!items.length) return null;

  return (
    <div className="ticker">
      <div className="ticker-label">Live campus updates</div>
      <div className="ticker-viewport">
        <div className="ticker-track">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <Link to={item.link} className="ticker-link">
                {item.text}
              </Link>
              <span> &nbsp; • &nbsp; </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TickerBar;

