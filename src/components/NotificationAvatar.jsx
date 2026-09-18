import { useId } from 'react';

export default function NotificationAvatar({ profile, className }) {
  const clipId = useId();

  return <svg className={className} viewBox="0 0 80 80" aria-hidden="true">
    <defs><clipPath id={clipId}><circle cx="40" cy="40" r="38" /></clipPath></defs>
    <g clipPath={`url(#${clipId})`}>
      <path fill={profile.background} d="M0 0h80v80H0z" />
      {profile.longHair && <ellipse cx="40" cy="40" rx="23" ry="30" fill={profile.hair} />}
      <ellipse cx="40" cy="83" rx="31" ry="28" fill={profile.shirt} />
      <path d="M33 48h14v17H33z" fill={profile.skin} />
      <ellipse cx="40" cy="33" rx="18" ry="23" fill={profile.skin} />
      <path d="M21 31C18 5 60 2 59 31L50 20c-8 7-18 4-29 11Z" fill={profile.hair} />
      <g fill="#332521"><circle cx="33" cy="34" r="1.5" /><circle cx="47" cy="34" r="1.5" /></g>
      <path d="M34 45q6 5 12 0" fill="none" stroke="#8b4e3b" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>;
}
