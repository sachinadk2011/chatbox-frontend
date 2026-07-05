/**
 * useResourceFromUrl.js
 *
 * PURPOSE:
 *   Generic "wall 2" resolver — given an id from the URL and a dataset that
 *   may still be loading, decides one of three outcomes:
 *     1. No id in the URL          → onFound(null)   (caller clears selection)
 *     2. Dataset not loaded yet    → do nothing, wait
 *     3. id found in dataset       → onFound(resource)
 *     4. Dataset loaded, not found → onNotFound()
 *
 *   This is the ONLY piece that repeats across every future route
 *   (chats, friends/list, groups, profiles...). Only findFn/onFound/onNotFound
 *   change per route — the waiting/finding logic never does.
 *
 * INPUTS:
 *   id         — the :param from useParams(), or undefined
 *   dataset    — array to search (friends, groups, etc.)
 *   isLoaded   — boolean; true once dataset has been fetched at least once
 *   findFn     — (id, dataset) => resource | undefined
 *   onFound    — (resource | null) => void
 *   onNotFound — () => void
 */
import { useEffect } from 'react';

export const useResourceFromUrl = ({ id, dataset, isLoaded, findFn, onFound, onNotFound }) => {
  useEffect(() => {
    console.info('useResourceFromUrl: id=', id, 'isLoaded=', isLoaded, 'dataset.length=', dataset?.length, dataset);
    if (!id) {
      onFound(null); // no id → caller clears selection (e.g. /chats with no :userId)
      return;
    }
    if (!isLoaded) return; // dataset still loading — wait, don't judge yet

    const resource = findFn(id, dataset);
    if (resource) onFound(resource);
    else onNotFound();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dataset, isLoaded]);
};