import Image from "next/image";
import { MapPin, Building, Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatDate } from "@/lib/utils";
import type { GitHubProfile } from "@/lib/github";

interface ProfileHeaderProps {
  profile: GitHubProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex items-start gap-4 sm:gap-6">
      {/* Avatar — links to GitHub profile */}
      <a
        href={`https://github.com/${profile.login}`}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-full ring-2 ring-transparent hover:ring-[var(--accent)] transition-all duration-200"
        title={`View ${profile.login} on GitHub`}
      >
        <Image
          src={profile.avatarUrl}
          alt={`${profile.login}'s avatar`}
          width={80}
          height={80}
          className="rounded-full border-2 border-[var(--border)] shadow-lg"
          priority
        />
      </a>

      <div className="flex-1 min-w-0">
        {/* Name + username */}
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] truncate">
            <a
              href={`https://github.com/${profile.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--accent)] transition-colors"
            >
              {profile.name || profile.login}
            </a>
          </h1>
          {profile.name && (
            <Badge variant="secondary" className="font-mono text-xs">
              @{profile.login}
            </Badge>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
          {profile.company && (
            <span className="flex items-center gap-1">
              <Building className="h-3.5 w-3.5" />
              {profile.company}
            </span>
          )}
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {profile.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {formatNumber(profile.followers.totalCount)} followers
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Joined {formatDate(profile.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
