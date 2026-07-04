/**
 * ListPanel.jsx
 *
 * PURPOSE:
 *   A generic, reusable scrollable list shell.
 *
 *   It owns ONLY:
 *     • The outer scroll container (overflow-y-auto, h-full)
 *     • Mapping over items and delegating rendering to renderItem
 *     • The empty-state branch when items.length === 0
 *
 *   It knows NOTHING about: chats, friends, groups, messages, contexts, or APIs.
 *   Any feature that needs a scrollable list of items with an empty state can
 *   use this component — no edits to ListPanel are ever needed.
 *
 * PROP SHAPE:
 *   items          — T[]                            required
 *   keyExtractor   — (item: T) => string            required — unique key per item
 *   renderItem     — (item: T, index: number) => ReactNode  required — owns padding/hover/cursor
 *   emptyState     — ReactNode                      optional — shown when items.length === 0
 *   className      — string                         optional — extra classes on scroll container
 *
 * EXAMPLE — ChatSidebarList (current consumer):
 *   <ListPanel
 *     items={sortedFriends}
 *     keyExtractor={(f) => f._id}
 *     emptyState={<p>No chats yet</p>}
 *     renderItem={(friend) => (
 *       <div className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
 *         <ChatList variant="chat" name={friend.name} ... />
 *       </div>
 *     )}
 *   />
 *
 * EXAMPLE — GroupSidebarList (hypothetical future consumer, no changes here):
 *   <ListPanel
 *     items={sortedGroups}
 *     keyExtractor={(g) => g._id}
 *     emptyState={<p>No groups yet</p>}
 *     renderItem={(group) => (
 *       <div className="flex items-center mb-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
 *            onClick={() => openGroup(group._id)}>
 *         <GroupCard name={group.name} memberCount={group.memberCount} />
 *       </div>
 *     )}
 *   />
 */

import React from 'react';

const ListPanel = ({
  items,
  keyExtractor,
  renderItem,
  emptyState,
  className = '',
}) => (
  <div className={`overflow-y-auto h-full p-3 pb-4 ${className}`}>
    {items.length === 0
      ? (emptyState ?? (
          <p className="text-center text-sm text-gray-400 mt-10 select-none">
            Nothing here yet
          </p>
        ))
      : items.map((item, index) => (
          <React.Fragment key={keyExtractor(item)}>
            {renderItem(item, index)}
          </React.Fragment>
        ))
    }
  </div>
);

export default ListPanel;
