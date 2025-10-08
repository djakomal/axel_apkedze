import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const UserProfilesList = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, full_name, email, avatar_url, role");
      if (error) {
        setError(error.message);
      } else {
        setProfiles(data);
      }
      setLoading(false);
    };
    fetchProfiles();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Profils utilisateurs</h2>
      <ul className="space-y-2">
        {profiles.map((profile) => (
          <li key={profile.id} className="p-2 border rounded flex items-center space-x-4">
            {profile.avatar_url && (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-10 h-10 rounded-full" />
            )}
            <div>
              <div className="font-semibold">{profile.full_name}</div>
              <div className="text-sm text-gray-500">{profile.email}</div>
              <div className="text-xs text-gray-400">Rôle: {profile.role}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserProfilesList;