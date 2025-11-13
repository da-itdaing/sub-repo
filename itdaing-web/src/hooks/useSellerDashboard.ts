import { useEffect, useState, useCallback } from 'react';
import { sellerService } from '../services/sellerService';
import { SellerProfile } from '../types/seller';
import { PopupSummary } from '../types/popup';

let cachedProfile: SellerProfile | null = null;
let profileInflight: Promise<SellerProfile> | null = null;

let cachedPopups: PopupSummary[] | null = null;
let popupsInflight: Promise<PopupSummary[]> | null = null;

async function loadProfile(): Promise<SellerProfile> {
  if (cachedProfile) {
    return cachedProfile;
  }
  if (!profileInflight) {
    profileInflight = sellerService.getMyProfile()
      .then(result => {
        cachedProfile = result;
        profileInflight = null;
        return result;
      })
      .catch(error => {
        profileInflight = null;
        throw error;
      });
  }
  return profileInflight;
}

async function loadPopups(): Promise<PopupSummary[]> {
  if (cachedPopups) {
    return cachedPopups;
  }
  if (!popupsInflight) {
    popupsInflight = sellerService.getMyPopups()
      .then(result => {
        cachedPopups = result;
        popupsInflight = null;
        return result;
      })
      .catch(error => {
        popupsInflight = null;
        throw error;
      });
  }
  return popupsInflight;
}

export function useMySellerProfile() {
  const [profile, setProfile] = useState<SellerProfile | null>(cachedProfile);
  const [loading, setLoading] = useState(!cachedProfile);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    if (cachedProfile) {
      setProfile(cachedProfile);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    loadProfile()
      .then(result => {
        if (!mounted) return;
        setProfile(result);
        setError(null);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      cachedProfile = null;
      const result = await sellerService.getMyProfile();
      cachedProfile = result;
      setProfile(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { profile, loading, error, refetch };
}

export function useMySellerPopups() {
  const [popups, setPopups] = useState<PopupSummary[] | null>(cachedPopups);
  const [loading, setLoading] = useState(!cachedPopups);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    if (cachedPopups) {
      setPopups(cachedPopups);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    loadPopups()
      .then(result => {
        if (!mounted) return;
        setPopups(result);
        setError(null);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      cachedPopups = null;
      const result = await sellerService.getMyPopups();
      cachedPopups = result;
      setPopups(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { popups, loading, error, refetch };
}

export function clearSellerDashboardCache() {
  cachedProfile = null;
  cachedPopups = null;
}
