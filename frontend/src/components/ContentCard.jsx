/**
 * ContentCard.jsx
 *
 * Displays a single content item (news, job, blog, article) in a card format.
 */

import React from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Calendar, Tag, Link as LinkIcon, User, Layers } from 'lucide-react'; // Import icons

const ContentCard = ({ content }) => {
  // Fallback for content that might not have all fields
  const {
    _id,
    type,
    title,
    description,
    url,
    sourceName,
    publishedAt,
    imageUrl,
    jobDetails,
    author,
    tags,
    relevanceScore
  } = content;

  // Format date
  const timeAgo = publishedAt ? formatDistanceToNow(parseISO(publishedAt), { addSuffix: true }) : 'Unknown date';

  const defaultImage = '/src/assets/webmethods-bg-placeholder.png'; // A generic placeholder image

  // Determine card header color based on content type
  const typeColors = {
    news: 'bg-primary-600',
    job: 'bg-secondary-600',
    blog: 'bg-indigo-600',
    article: 'bg-purple-600',
    documentation: 'bg-blue-600',
    tutorial: 'bg-teal-600',
    video: 'bg-red-600',
    other: 'bg-gray-600',
  };
  const typeBadgeClass = typeColors[type] || 'bg-gray-600';

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Type Badge and Image */}
      <div className="relative">
        <span
          className={`absolute top-0 left-0 text-white text-xs font-semibold px-3 py-1 rounded-br-lg z-10 ${typeBadgeClass}`}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
        <img
          src={imageUrl || defaultImage}
          alt={title || 'Content Image'}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }} // Fallback on error
        />
      </div>

      <div className="p-5 flex-grow flex flex-col">
        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
          >
            {truncateText(title, 100)}
          </a>
        </h3>

        {/* Description */}
        {description && (
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 flex-grow">
            {truncateText(description, 180)}
          </p>
        )}

        {/* Metadata */}
        <div className="text-gray-600 dark:text-gray-400 text-sm space-y-1 mb-4">
          <div className="flex items-center">
            <Layers size={16} className="mr-2 text-primary-500" />
            <span>Source: <span className="font-medium text-gray-800 dark:text-gray-200">{sourceName}</span></span>
          </div>
          {author?.name && (
            <div className="flex items-center">
              <User size={16} className="mr-2 text-primary-500" />
              <span>Author: <span className="font-medium text-gray-800 dark:text-gray-200">{author.name}</span></span>
            </div>
          )}
          {publishedAt && (
            <div className="flex items-center">
              <Calendar size={16} className="mr-2 text-primary-500" />
              <span>Published: {timeAgo}</span>
            </div>
          )}
          {relevanceScore && (
            <div className="flex items-center">
              <Tag size={16} className="mr-2 text-primary-500" />
              <span>Relevance: <span className="font-medium text-gray-800 dark:text-gray-200">{relevanceScore}%</span></span>
            </div>
          )}
        </div>

        {/* Job Details (conditional for type 'job') */}
        {type === 'job' && jobDetails && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4 text-sm text-gray-700 dark:text-gray-300">
            {jobDetails.company && (
              <div className="flex items-center mb-1">
                <Briefcase size={16} className="mr-2 text-secondary-500" />
                <span>Company: <span className="font-medium">{jobDetails.company}</span></span>
              </div>
            )}
            {jobDetails.location && (
              <div className="flex items-center mb-1">
                <MapPin size={16} className="mr-2 text-secondary-500" />
                <span>Location: <span className="font-medium">{jobDetails.location}</span></span>
              </div>
            )}
            {jobDetails.employmentType && (
              <div className="flex items-center">
                <Tag size={16} className="mr-2 text-secondary-500" />
                <span>Type: <span className="font-medium">{jobDetails.employmentType}</span></span>
              </div>
            )}
            {jobDetails.salary && (
                <div className="flex items-center">
                    <span className="font-medium">Salary: {jobDetails.salary}</span>
                </div>
            )}
          </div>
        )}

        {/* Read More / View Job Button */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-300 text-sm shadow-md"
          >
            {type === 'job' ? 'View Job' : 'Read More'}
            <LinkIcon size={16} className="ml-2" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;