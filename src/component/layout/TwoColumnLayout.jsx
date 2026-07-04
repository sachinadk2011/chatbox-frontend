/**
 * TwoColumnLayout.jsx
 *
 * PURPOSE:
 *   A generic, reusable two-column page shell used by any module that needs
 *   a sidebar + main content panel.  It knows nothing about chats, friends,
 *   or messages — it is purely a layout primitive.
 *
 * WHY it exists:
 *   ChatLayout.jsx was the only two-column layout but was hardwired to chat
 *   components.  Future modules (Groups, Communities, Settings, Profile, etc.)
 *   would have needed to duplicate the same responsive sidebar / full-screen
 *   panel split logic.  TwoColumnLayout captures that logic once.
 *
 * PROPS:
 *   sidebarContent  — ReactNode rendered in the left panel (always visible on desktop)
 *   mainContent     — ReactNode rendered in the right panel when hasItemOpen is true
 *   emptyState      — ReactNode rendered in the right panel when hasItemOpen is false
 *   hasItemOpen     — boolean that controls mobile view (sidebar OR main, not both)
 *
 * RESPONSIVE BEHAVIOUR (unchanged from original ChatLayout):
 *   Desktop (md+): left panel is fixed width, right panel is flex-1
 *   Mobile (<md):  only ONE panel is shown at a time based on hasItemOpen
 *
 * HOW to use for a new module:
 *   1. Build your own SidebarContent component with the data you need.
 *   2. Build your own MainContent component.
 *   3. Wrap them in <TwoColumnLayout>.
 *   No changes to TwoColumnLayout are ever needed.
 *
 * @example
 *   <TwoColumnLayout
 *     hasItemOpen={!!selectedGroup}
 *     sidebarContent={<GroupSidebarList />}
 *     mainContent={<GroupWindow />}
 *     emptyState={<div>Select a group</div>}
 *   />
 */

import React from 'react';

const TwoColumnLayout = ({ sidebarContent, mainContent, emptyState, hasItemOpen }) => (
  <div className="flex w-full h-full overflow-hidden bg-gray-50">

    {/* ── Left panel — sidebar ──────────────────────────────────────────── */}
    {/* Desktop: always shown at fixed width. Mobile: hide when item is open */}
    <div
      className={[
        'flex-shrink-0 flex flex-col bg-white border-r border-gray-200',
        'w-full md:w-80 lg:w-96',
        hasItemOpen ? 'hidden md:flex' : 'flex',
      ].join(' ')}
    >
      {sidebarContent}
    </div>

    {/* ── Right panel — main content ────────────────────────────────────── */}
    {/* Desktop: always shown (flex-1). Mobile: show full-screen when open */}
    <div
      className={[
        'flex-1 flex flex-col min-w-0 min-h-0',
        hasItemOpen ? 'flex' : 'hidden md:flex',
      ].join(' ')}
    >
      {hasItemOpen ? mainContent : emptyState}
    </div>
  </div>
);

export default TwoColumnLayout;
