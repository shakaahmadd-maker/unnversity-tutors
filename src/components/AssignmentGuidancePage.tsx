import React, { useMemo } from 'react';
import { User } from '../types';
import { getDedicatedServiceEditorialConfig } from '../data/editorialServiceContent';
import ServiceEditorialTemplate from './ServiceEditorialTemplate';

interface AssignmentGuidancePageProps {
  tutors: User[];
  onNavigate: (view: string) => void;
}

export default function AssignmentGuidancePage({
  tutors,
  onNavigate,
}: AssignmentGuidancePageProps) {
  const config = useMemo(() => getDedicatedServiceEditorialConfig('assignment'), []);

  return (
    <ServiceEditorialTemplate
      config={config}
      tutors={tutors}
      onNavigate={onNavigate}
    />
  );
}
