import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ActivityIndicator, 
  Alert, 
  Platform,
  Image
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  BarChart3,
  Clock,
  Activity,
  Target,
  ChevronDown,
  Search
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

const showAlert = (title: string, message: string, actions?: any[]) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}: ${message}`);
    if (actions && actions[0] && actions[0].onPress) {
      actions[0].onPress();
    }
  } else {
    Alert.alert(title, message, actions);
  }
};

const Insights = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    completed: 0,
  });

  const [profile, setProfile] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [editingPhone, setEditingPhone] = useState("");
  const [editingSpecialization, setEditingSpecialization] = useState("");
  const [editingOrg, setEditingOrg] = useState({ id: "", name: "" });

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [orgModalVisible, setOrgModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState<{ uri: string; base64?: string } | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const webFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile((prev: any) => {
          if (editModalVisible) return prev;
          return profileData;
        });
      }

      const role = profileData?.role || 'doctor';

      let query = supabase.from('cases').select('status');
      if (role === 'organization') {
        query = query.eq('org_id', user.id);
      } else {
        query = query.eq('doctor_id', user.id);
      }

      const { data } = await query;

      if (data) {
        setMetrics({
          total: data.length,
          active: data.filter(c => c.status === 'active' || c.status === 'in-progress').length,
          completed: data.filter(c => c.status === 'completed').length,
        });
      }
      setLoading(false);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [editModalVisible]);

  const fetchOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'organization');
      if (error) throw error;
      if (data) {
        setOrganizations(data);
      }
    } catch (err) {
      console.error("Error fetching organizations:", err);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleOpenEditProfile = () => {
    if (!profile) return;
    setEditingName(profile.full_name || "");
    setEditingPhone(profile.phone || "");
    setEditingSpecialization(profile.specialization || "");
    setEditingOrg({ id: profile.org_id || "", name: profile.org_name || "" });
    setEditingAvatar(null);
    setEditModalVisible(true);
    fetchOrganizations();
  };

  const pickAvatar = async () => {
    if (Platform.OS === 'web') {
      // Always create a fresh input so onChange fires reliably on re-select
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      document.body.appendChild(input);
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        document.body.removeChild(input);
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          const base64 = dataUrl.split(',')[1];
          setEditingAvatar({ uri: dataUrl, base64 });
        };
        reader.readAsDataURL(file);
      };
      input.oncancel = () => document.body.removeChild(input);
      input.click();
      return;
    }
    // Mobile: Try expo-image-picker first (allows native cropping)
    try {
      const ImagePicker = await import('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === 'granted') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
          base64: true,
        });
        if (!result.canceled && result.assets?.[0]) {
          const asset = result.assets[0];
          setEditingAvatar({ uri: asset.uri, base64: asset.base64 || undefined });
          return;
        }
      } else {
         Alert.alert('Permission Required', 'Please allow access to your photo library in Settings.');
      }
    } catch (err: any) {
      console.error('Mobile image picker error:', err);
      Alert.alert('Error', `Could not open image picker: ${err.message || err.toString()}`);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editingName.trim()) {
      showAlert("Validation Error", "Name cannot be empty.");
      return;
    }
    if (!editingPhone.trim()) {
      showAlert("Validation Error", "Phone number cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showAlert("Error", "No active user session found.");
        return;
      }

      const updateData: any = {
        full_name: editingName.trim(),
        phone: editingPhone.trim(),
      };

      if (profile.role === 'doctor') {
        updateData.specialization = editingSpecialization.trim();
        updateData.org_id = editingOrg.id || null;
        updateData.org_name = editingOrg.name || null;
      } else if (profile.role === 'lab') {
        updateData.org_id = editingOrg.id || null;
        updateData.org_name = editingOrg.name || null;
      }

      // Upload new avatar if selected
      if (editingAvatar?.base64) {
        setUploadingAvatar(true);
        try {
          const bytes = Uint8Array.from(atob(editingAvatar.base64), c => c.charCodeAt(0));
          const filePath = `${user.id}/avatar_${Date.now()}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from('profile-pictures')
            .upload(filePath, bytes, { contentType: 'image/jpeg', upsert: true });
          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(filePath);
          updateData.avatar_url = urlData.publicUrl;
        } finally {
          setUploadingAvatar(false);
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      // Update local profile state
      const updatedProfile = { ...profile, ...updateData };
      setProfile(updatedProfile);

      showAlert("Success", "Profile updated successfully.");
      setEditModalVisible(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      showAlert("Update Failed", err.message || "An error occurred while updating your profile.");
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: "Total Cases", value: metrics.total.toString(), icon: Activity, color: "#0EA5E9" },
    { label: "Active Cases", value: metrics.active.toString(), icon: Clock, color: "#8B5CF6" },
    { label: "Completed Cases", value: metrics.completed.toString(), icon: Target, color: "#10B981" },
  ];

  const completionRate = metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0;
  
  let rankingText = "Complete more cases to unlock your regional clinical ranking.";
  if (metrics.completed >= 5) {
    rankingText = "You are currently ranked in the top 10% of clinicians in your region.";
  } else if (metrics.completed >= 2) {
    rankingText = "You are currently ranked in the top 25% of clinicians in your region.";
  }

  return (
    <AppLayout>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <View style={styles.header}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.title}>Clinical Insights</Text>
            <Text style={styles.subtitle}>Your practice performance & clinical metrics</Text>
          </View>
          {profile && (
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={handleOpenEditProfile}
            >
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.iconBox, { backgroundColor: `${stat.color}15` }]}>
                <stat.icon size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{loading ? "-" : stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Clinical Guide Impact: {completionRate}% Completed</Text>
            <Text style={styles.heroText}>
              Your case completion rate is {completionRate}%. {rankingText}
            </Text>
            <TouchableOpacity 
              style={styles.heroButton}
              onPress={() => navigation.navigate("Procedures")}
            >
              <Text style={styles.heroButtonText}>View Detailed Report</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroGraphic}>
            <BarChart3 size={80} color="#FFFFFF" opacity={0.8} />
          </View>
        </View>

        {/* Edit Profile Modal */}
        <Modal 
          visible={editModalVisible} 
          transparent 
          animationType="slide"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPress={() => setEditModalVisible(false)}
            />
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={styles.modalHeader}>Edit Profile</Text>
                {profile && (
                  <View style={[
                    styles.roleBadge, 
                    profile.role === "organization" 
                      ? styles.roleBadgeOrg 
                      : (profile.role === "lab" ? styles.roleBadgeLab : styles.roleBadgeDr)
                  ]}>
                    <Text style={[
                      styles.roleBadgeText,
                      { color: profile.role === "organization" ? "#64748B" : (profile.role === "lab" ? "#4F46E5" : "#0369A1") }
                    ]}>{profile.role}</Text>
                  </View>
                )}
              </View>

              {/* Avatar Picker */}
              <TouchableOpacity onPress={pickAvatar} style={styles.avatarPickerContainer} activeOpacity={0.8}>
                {(editingAvatar?.uri || profile?.avatar_url) ? (
                  <Image
                    source={{ uri: editingAvatar?.uri || profile?.avatar_url }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarPlaceholderText}>
                      {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
                <View style={styles.avatarCameraOverlay}>
                  <Text style={styles.avatarCameraText}>📷</Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Tap to change profile photo</Text>

              <ScrollView 
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
              >
                {/* Full Name / Organization Name field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {profile?.role === "organization" ? "Organization Name" : "Full Name"}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter name"
                    value={editingName}
                    onChangeText={setEditingName}
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* Email field (Disabled) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address (Read-only)</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={profile?.email || ""}
                    editable={false}
                    selectTextOnFocus={false}
                  />
                  <Text style={styles.disabledText}>
                    Email cannot be edited because your cases and reports are associated with it.
                  </Text>
                </View>

                {/* Phone field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    value={editingPhone}
                    onChangeText={setEditingPhone}
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* Specialization field (Doctor only) */}
                {profile?.role === "doctor" && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Specialization</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Orthodontist"
                      value={editingSpecialization}
                      onChangeText={setEditingSpecialization}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                )}

                {/* Organization field (Doctor / Lab only) */}
                {(profile?.role === "doctor" || profile?.role === "lab") && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Select Organization</Text>
                    <TouchableOpacity 
                      style={styles.pickerTrigger}
                      onPress={() => setOrgModalVisible(true)}
                    >
                      <Text style={styles.pickerValue} numberOfLines={2}>
                        {editingOrg.name || "Choose Clinic/Hospital"}
                      </Text>
                      <ChevronDown size={18} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Buttons */}
                <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.saveButton, (saving || uploadingAvatar) && styles.buttonDisabled]}
                    onPress={handleUpdateProfile}
                    disabled={saving || uploadingAvatar}
                  >
                    {(saving || uploadingAvatar) ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Organization Select Modal */}
        <Modal 
          visible={orgModalVisible} 
          transparent 
          animationType="slide"
          onRequestClose={() => { setOrgModalVisible(false); setSearchQuery(""); }}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPress={() => { setOrgModalVisible(false); setSearchQuery(""); }}
            />
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Select Organization</Text>
              
              <View style={styles.searchContainer}>
                <Search size={18} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search clinic name..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={{ maxHeight: 300 }}>
                <ScrollView 
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {loadingOrgs ? (
                    <ActivityIndicator size="small" color="#0EA5E9" style={{ margin: 20 }} />
                  ) : organizations.length > 0 ? (
                    organizations
                      .filter(org => org.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(org => (
                        <TouchableOpacity 
                          key={org.id} 
                          style={styles.modalOption}
                          onPress={() => {
                            setEditingOrg({ id: org.id, name: org.full_name });
                            setOrgModalVisible(false);
                            setSearchQuery("");
                          }}
                        >
                          <Text style={styles.modalOptionText}>{org.full_name}</Text>
                        </TouchableOpacity>
                      ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.noData}>No organizations found.</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  heroCard: {
    backgroundColor: "#0EA5E9",
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    overflow: "hidden",
  },
  heroContent: {
    flex: 1,
    paddingRight: 80,
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  heroText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
    marginBottom: 16,
  },
  heroButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  heroButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0EA5E9",
  },
  heroGraphic: {
    position: "absolute",
    right: 24,
    top: 24,
    bottom: 24,
    justifyContent: "center",
    zIndex: 1,
  },
  editProfileButton: {
    backgroundColor: "#0EA5E915",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0EA5E930",
  },
  editProfileButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0EA5E9",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  roleBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 4, 
    alignSelf: 'flex-start' 
  },
  roleBadgeOrg: { backgroundColor: "#F1F5F9" },
  roleBadgeDr: { backgroundColor: "#E0F2FE" },
  roleBadgeLab: { backgroundColor: "#EEF2FF" },
  roleBadgeText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as any,
  },
  disabledInput: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
    color: "#64748B",
  },
  disabledText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
    lineHeight: 16,
  },
  pickerTrigger: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  pickerValue: {
    fontSize: 14,
    color: "#0F172A",
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as any,
  },
  modalOption: {
    minHeight: 50,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalOptionText: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
    textAlign: "center",
  },
  emptyState: {
    padding: 16,
    alignItems: "center",
  },
  noData: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
  },
  modalButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cancelButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#0EA5E9",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  avatarPickerContainer: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 4,
    position: 'relative',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#0EA5E9',
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0EA5E9',
  },
  avatarPlaceholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0EA5E9',
  },
  avatarCameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarCameraText: {
    fontSize: 14,
  },
  avatarHint: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 12,
  },
});

export default Insights;