import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      className={`copy-btn${copied ? " copied" : ""}`}
      onClick={copy}
      title="Copy"
    >
      {copied ? (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6L5 9L10 3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width="10"
          height="10"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        >
          <rect x="4" y="4" width="8" height="8" rx="1.5" />
          <path d="M10 4V2.5A1.5 1.5 0 0 0 8.5 1H2.5A1.5 1.5 0 0 0 1 2.5v6A1.5 1.5 0 0 0 2.5 10H4" />
        </svg>
      )}
    </button>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    api.get("/profile").then((r) => setProfile(r.data));
  }, []);

  const handlePw = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm)
      return setPwMsg({ type: "error", text: "Passwords do not match." });
    if (pwForm.next.length < 6)
      return setPwMsg({ type: "error", text: "Minimum 6 characters." });
    setPwLoading(true);
    setPwMsg(null);
    try {
      await api.put("/profile/password", {
        current_password: pwForm.current,
        new_password: pwForm.next,
      });
      setPwMsg({ type: "success", text: "Password updated." });
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPwMsg({ type: "error", text: err.response?.data?.error || "Failed." });
    } finally {
      setPwLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteInput !== user?.username) return;
    setDeleting(true);
    try {
      await api.delete("/profile");
      logout();
      navigate("/login");
    } catch {
      setDeleting(false);
    }
  };

  const joined = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account settings.</p>
      </div>

      {/* Two-column layout */}
      <div className="profile-two-col">
        {/* Identity */}
        <div className="profile-card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 18,
            }}
          >
            <div
              className="avatar"
              style={{
                background: user?.avatarColor || "#4F46E5",
                width: 46,
                height: 46,
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: "-0.02em",
                }}
              >
                {user?.username}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {user?.email}
              </div>
            </div>
          </div>
          <div className="profile-section-title">Account details</div>
          <div className="profile-info-grid">
            {[
              { label: "Username", value: profile?.username },
              { label: "Email", value: profile?.email },
              { label: "Member since", value: joined },
              {
                label: "Profile ID",
                value: profile?.profileId,
                copyable: true,
              },
            ].map((item) => (
              <div key={item.label} className="profile-info-cell">
                <div className="profile-info-cell-label">{item.label}</div>
                <div className="profile-info-cell-val">
                  <span>{item.value || "—"}</span>
                  {item.copyable && item.value && <CopyBtn text={item.value} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Password */}
        <div className="profile-card">
          <div className="profile-section-title">Change password</div>
          <form className="profile-form" onSubmit={handlePw}>
            {pwMsg && (
              <div
                className={`alert alert-${pwMsg.type === "error" ? "error" : "success"}`}
              >
                {pwMsg.text}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Current password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Your current password"
                value={pwForm.current}
                onChange={(e) =>
                  setPwForm((f) => ({ ...f, current: e.target.value }))
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">New password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={pwForm.next}
                onChange={(e) =>
                  setPwForm((f) => ({ ...f, next: e.target.value }))
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm new password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Repeat new password"
                value={pwForm.confirm}
                onChange={(e) =>
                  setPwForm((f) => ({ ...f, confirm: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={pwLoading}
              >
                {pwLoading ? (
                  <>
                    <div className="spinner" />
                    Updating…
                  </>
                ) : (
                  "Update password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="profile-danger-card">
        <div className="profile-danger-title">Danger zone</div>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            marginBottom: 14,
            lineHeight: 1.6,
          }}
        >
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        {!showDelete ? (
          <button
            className="btn btn-danger"
            onClick={() => setShowDelete(true)}
          >
            Delete account
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Type{" "}
              <strong
                style={{
                  fontFamily: "monospace",
                  background: "var(--bg-hover)",
                  padding: "1px 5px",
                  borderRadius: 4,
                }}
              >
                {user?.username}
              </strong>{" "}
              to confirm:
            </p>
            <input
              type="text"
              className="delete-confirm"
              placeholder={user?.username}
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleteInput !== user?.username || deleting}
              >
                {deleting ? "Deleting…" : "Confirm delete"}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowDelete(false);
                  setDeleteInput("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
