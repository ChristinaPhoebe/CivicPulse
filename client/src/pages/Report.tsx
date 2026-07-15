import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const categoryOptions = [
  { label: 'Pothole' },
  { label: 'Streetlight' },
  { label: 'Garbage' },
  { label: 'Graffiti' },
  { label: 'Other' },
];

const TITLE_MAX = 120;
const DESC_MAX = 1000;

const Report = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoto = (file: File) => {
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePhoto(file);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
    );
  };

  const geocode = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        { headers: { 'Accept': 'application/json' } },
      );
      const data = await res.json();
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch {
      // geocoding failed
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    setIsSubmitting(true);
    try {
      let finalCoords = coords;
      if (!finalCoords && location.trim()) {
        finalCoords = await geocode(location);
      }
      await fetch(`${API_URL}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          location,
          lat: finalCoords?.lat || 0,
          lng: finalCoords?.lng || 0,
        }),
      });
    } catch {
      // silently fail
    } finally {
      setIsSubmitting(false);
      navigate('/dashboard');
    }
  };

  const canSubmit = category && title.trim() && description.trim() && location.trim();

  return (
    <div className="report-page">
      <div className="container">
        <div className="report-card">
          <h1 className="report-heading">Report an issue</h1>
          <p className="report-sub">
            Share what you've spotted. Clear details help crews resolve it
            faster.
          </p>

          <form onSubmit={handleSubmit} className="report-form">
            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <div className="category-picker">
                {categoryOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    className={`category-pill ${category === opt.label ? 'active' : ''}`}
                    onClick={() => setCategory(opt.label)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="report-title">
                  Title
                </label>
                <span className="char-count">
                  {title.length}/{TITLE_MAX}
                </span>
              </div>
              <input
                id="report-title"
                type="text"
                className="form-input"
                placeholder="Brief summary of the issue"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
                required
                maxLength={TITLE_MAX}
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="report-desc">
                  Description
                </label>
                <span className="char-count">
                  {description.length}/{DESC_MAX}
                </span>
              </div>
              <textarea
                id="report-desc"
                className="form-textarea"
                placeholder="What did you see? How long has it been there?"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value.slice(0, DESC_MAX))
                }
                required
                maxLength={DESC_MAX}
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            {/* Location */}
            <div className="form-group">
              <label className="form-label" htmlFor="report-location">
                Location
              </label>
              <div className="location-field">
                <input
                  id="report-location"
                  type="text"
                  className="form-input"
                  placeholder="Address or landmark"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setCoords(null); }}
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-use-location"
                  onClick={handleUseMyLocation}
                  disabled={isLocating || isSubmitting}
                >
                  {isLocating ? 'Locating...' : 'Use mine'}
                </button>
              </div>
            </div>

            {/* Photo */}
            <div className="form-group">
              <label className="form-label">
                Photo
                <span className="form-label-hint">
                  Optional &middot; up to 5MB
                </span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
              />
              {photoPreview ? (
                <div className="photo-preview">
                  <img src={photoPreview} alt="Upload preview" />
                  <button
                    type="button"
                    className="photo-remove"
                    onClick={() => {
                      setPhotoPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="photo-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="photo-dropzone-icon">+</span>
                  Tap to upload a photo
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Report;
