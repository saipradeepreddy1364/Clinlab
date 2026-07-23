import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Platform, Alert, Image, Modal, TextInput } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAppData } from "@/lib/AppDataContext";
import {
  Activity,
  ClipboardList,
  Stethoscope,
  Users,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
  UserCheck,
  Camera,
  Upload,
  Plus,
  RefreshCw,
  X,
} from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";
import {
  fetchModelInfo,
  addProcedureStep,
  uploadProceduresCsv,
  uploadProceduresDocument,
  retrainModel,
  type ModelMetadata
} from "@/lib/backendApi";

const { width } = Dimensions.get("window");

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

const OrgDashboard = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const { data: preloadedData, isPreloaded } = useAppData();
  const [loading, setLoading] = useState(route?.params?.preloaded ? false : !isPreloaded);
  const [stats, setStats] = useState(preloadedData.stats);
  const [doctors, setDoctors] = useState<any[]>(preloadedData.doctors);
  const [recentCases, setRecentCases] = useState<any[]>(preloadedData.recentCases);
  const [profile, setProfile] = useState<any>(preloadedData.profile);
  const [pendingCount, setPendingCount] = useState(preloadedData.pendingCount);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [editingPhone, setEditingPhone] = useState("");
  const [editingAvatar, setEditingAvatar] = useState<{ uri: string; base64?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // ── Model & Admin Management States ──────────────────────────────────────
  const [modelInfo, setModelInfo] = useState<ModelMetadata | null>(null);
  const [loadingModelInfo, setLoadingModelInfo] = useState(false);
  const [modelInfoError, setModelInfoError] = useState<string | null>(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [retraining, setRetraining] = useState(false);

  // Manual Step addition form states
  const [addStepModalVisible, setAddStepModalVisible] = useState(false);
  const [newProcName, setNewProcName] = useState("");
  const [newProcSubtype, setNewProcSubtype] = useState("");
  const [newProcCurrent, setNewProcCurrent] = useState("");
  const [newProcNext, setNewProcNext] = useState("");
  const [savingNewStep, setSavingNewStep] = useState(false);

  const loadModelInfo = async () => {
    try {
      setLoadingModelInfo(true);
      setModelInfoError(null);
      const info = await fetchModelInfo();
      setModelInfo(info);
    } catch (err: any) {
      console.error(err);
      setModelInfoError("Could not retrieve AI model info.");
    } finally {
      setLoadingModelInfo(false);
    }
  };

  useEffect(() => {
    loadModelInfo();
  }, []);

  const handlePickDocument = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv,text/csv,.pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      input.multiple = false;
      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const ext = file.name.split('.').pop()?.toLowerCase();
        try {
          setUploadingCsv(true);
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          
          let result;
          if (ext === 'csv') {
            result = await uploadProceduresCsv(file.name, file.type || 'text/csv', bytes);
          } else {
            result = await uploadProceduresDocument(file.name, file.type || 'application/octet-stream', bytes);
          }
          
          if (result.success) {
            showAlert("Success", result.message || "Document processed and steps imported successfully!");
            loadModelInfo();
          } else {
            showAlert("Upload failed", result.message || "Unknown error");
          }
        } catch (err: any) {
          showAlert('Upload failed', err.message);
        } finally {
          setUploadingCsv(false);
        }
      };
      input.click();
    } else {
      (async () => {
        try {
          const DocumentPicker = await import('expo-document-picker');
          const result = await DocumentPicker.getDocumentAsync({
            type: [
              'text/comma-separated-values', 
              'text/csv', 
              'application/pdf', 
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ],
            copyToCacheDirectory: true,
          });

          if (result.canceled || !result.assets || result.assets.length === 0) return;
          const asset = result.assets[0];

          setUploadingCsv(true);
          try {
            const FileSystem = await import('expo-file-system/legacy');
            const base64 = await (FileSystem as any).readAsStringAsync(asset.uri, {
              encoding: (FileSystem as any).EncodingType?.Base64 || 'base64',
            });

            const binaryStr = atob(base64);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              bytes[i] = binaryStr.charCodeAt(i);
            }
            
            const ext = asset.name.split('.').pop()?.toLowerCase();
            let uploadResult;
            if (ext === 'csv') {
              uploadResult = await uploadProceduresCsv(
                asset.name, 
                asset.mimeType || 'text/csv', 
                bytes,
                asset.uri
              );
            } else {
              uploadResult = await uploadProceduresDocument(
                asset.name,
                asset.mimeType || 'application/octet-stream',
                bytes,
                asset.uri
              );
            }
            
            if (uploadResult.success) {
              showAlert("Success", uploadResult.message || "Document processed and steps imported successfully!");
              loadModelInfo();
            } else {
              showAlert("Upload failed", uploadResult.message || "Unknown error");
            }
          } catch (fsErr: any) {
            showAlert("Error", "Could not process picked file: " + fsErr.message);
          }
        } catch (err: any) {
          showAlert("Error", 'Could not open file picker: ' + err.message);
        } finally {
          setUploadingCsv(false);
        }
      })();
    }
  };

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      const res = await retrainModel();
      if (res.success) {
        showAlert("Success", res.message || "Model retrained and loaded in production!");
        if (res.metadata) {
          setModelInfo(res.metadata);
        } else {
          loadModelInfo();
        }
      } else {
        showAlert("Retraining failed", res.message || "Unknown error");
      }
    } catch (err: any) {
      showAlert("Retraining failed", err.message);
    } finally {
      setRetraining(false);
    }
  };

  const handleSaveStep = async () => {
    if (!newProcName.trim() || !newProcCurrent.trim() || !newProcNext.trim()) {
      showAlert("Validation Error", "Procedure, Current Step, and Next Step are required fields.");
      return;
    }
    try {
      setSavingNewStep(true);
      const res = await addProcedureStep({
        procedure: newProcName.trim(),
        subtype: newProcSubtype.trim(),
        current_step: newProcCurrent.trim(),
        next_step: newProcNext.trim(),
      });
      if (res.success) {
        showAlert("Success", res.message || "New transition step saved successfully!");
        setAddStepModalVisible(false);
        setNewProcName("");
        setNewProcSubtype("");
        setNewProcCurrent("");
        setNewProcNext("");
        loadModelInfo();
      } else {
        showAlert("Error", "Could not add step: " + (res.message || "Unknown error"));
      }
    } catch (err: any) {
      showAlert("Error", "Error saving step: " + err.message);
    } finally {
      setSavingNewStep(false);
    }
  };

  const handleOpenEditProfile = () => {
    if (!profile) return;
    setEditingName(profile.full_name || profile.org_name || "");
    setEditingPhone(profile.phone || "");
    setEditingAvatar(null);
    setEditModalVisible(true);
  };

  const pickAvatar = async () => {
    if (Platform.OS === 'web') {
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
    try {
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
        }
      } else {
        showAlert('Permission Required', 'Please allow access to your photo library in Settings.');
      }
    } catch (err: any) {
      console.error('Image picker error:', err);
      showAlert('Error', `Could not open image picker: ${err.message || err.toString()}`);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editingName.trim()) {
      showAlert("Validation Error", "Organization name cannot be empty.");
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
        org_name: editingName.trim(),
        phone: editingPhone.trim(),
      };

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
        } catch (upErr: any) {
          console.error("Upload error details:", upErr);
          throw upErr;
        } finally {
          setUploadingAvatar(false);
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, ...updateData });
      showAlert("Success", "Profile updated successfully.");
      setEditModalVisible(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      showAlert("Update Failed", err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Fetch Doctors in Org FIRST so we can map them
      const { data: profileList } = await supabase
        .from('profiles')
        .select('*')
        .eq('org_id', user.id)
        .eq('role', 'doctor')
        .eq('status', 'approved');
      
      if (profileList) {
        setDoctors(profileList);
      }

      // 1. Fetch Stats
      const { data: cases, error: caseError } = await supabase
        .from('cases')
        .select('*')
        .eq('org_id', user.id);

      if (!caseError && cases) {
        setStats({
          active: cases.filter(c => c.status === 'in-progress').length,
          lab: cases.filter(c => c.status === 'lab-pending' || c.status === 'lab-received').length,
          checkup: cases.filter(c => c.status === 'checkup-pending').length,
          totalDoctors: new Set(cases.map(c => c.doctor_id)).size,
        });
        
        // Map doctor names to recent cases
        const mappedRecentCases = cases.slice(0, 5).map(c => {
          const doctorName = profileList?.find(d => d.id === c.doctor_id)?.full_name || "Unknown Doctor";
          return { ...c, doctor_name: doctorName };
        });
        setRecentCases(mappedRecentCases);
      }



      // 3. Fetch Org Profile
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (p) {
        setProfile(p);
        
        // Self-Correction: If name is missing or placeholder, try to restore from metadata
        if (!p.full_name || p.full_name === "New User" || !p.org_name) {
          const metadata = user.user_metadata;
          const recoveredName = p.full_name && p.full_name !== "New User" ? p.full_name : (metadata?.full_name || metadata?.name);
          const recoveredOrg = p.org_name || metadata?.org_name || metadata?.organization_name || recoveredName;
          
          if (recoveredName || recoveredOrg) {
            await supabase.from('profiles').update({
              full_name: recoveredName || p.full_name,
              org_name: recoveredOrg || p.org_name
            }).eq('id', user.id);
            // Refresh local state
            setProfile({ ...p, full_name: recoveredName || p.full_name, org_name: recoveredOrg || p.org_name });
          }
        }
      }

      // 4. Check for Pending Approvals
      console.log("OrgDashboard: Checking pending approvals for Org ID:", user.id);
      const { count, error: pendingError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', user.id)
        .eq('role', 'doctor')
        .eq('status', 'pending');
      
      if (pendingError) console.error("OrgDashboard: Pending Query Error:", pendingError);
      console.log("OrgDashboard: Found pending doctors:", count);
      
      setPendingCount(count || 0);
    } catch (err) {
      console.error("OrgDashboard Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const scanAllDoctors = async () => {
    const { data, count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'doctor');
    
    if (error) {
      showAlert("Scan Error", error.message);
    } else {
      showAlert("Deep Scan Result", `Found ${count} total doctors in the database. (If this is 0, signup is failing. If this is more than 0 but your dashboard shows 0, it's an RLS policy issue!)`);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    // Add polling since Supabase replication might not be enabled
    const pollInterval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [fetchData]);


  if (loading) {
    return (
      <AppLayout>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <View style={styles.container}>
        {/* Welcome Card (Personalized) */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeInfo}>
            <Text style={styles.welcomeGreeting}>Welcome back,</Text>
            <Text 
              style={styles.welcomeName}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.5}
            >
              {profile?.full_name || profile?.org_name || "Organization"}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              <View style={styles.verifiedBadge}>
                <UserCheck size={12} color="#10B981" />
                <Text style={styles.verifiedText}>Verified Clinical Hub</Text>
              </View>
              <TouchableOpacity 
                style={styles.editProfileBadgeBtn}
                onPress={handleOpenEditProfile}
              >
                <Text style={styles.editProfileBadgeText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.dashboardAvatarContainer}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.dashboardAvatar} />
            ) : (
              <View style={styles.dashboardAvatarPlaceholder}>
                <Text style={styles.dashboardAvatarPlaceholderText}>
                  {(profile?.full_name || profile?.org_name || "O").charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {pendingCount > 0 && (
          <TouchableOpacity 
            style={styles.approvalAlert}
            onPress={() => navigation.navigate("ApprovalCenter")}
          >
            <View style={styles.alertIconBox}>
              <UserCheck size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Pending Clinical Approvals</Text>
              <Text style={styles.alertSubtitle}>
                You have {pendingCount} new {pendingCount === 1 ? 'request' : 'requests'} waiting for your approval.
              </Text>
            </View>
            <ChevronRight size={16} color="#0EA5E9" />
          </TouchableOpacity>
        )}

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Clinical Overview</Text>
          <Text style={styles.subtext}>Monitor activity across all {doctors.length} departments.</Text>
        </View>
        

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity 
            style={[styles.statCard, { borderLeftColor: "#0EA5E9" }]}
            onPress={() => navigation.navigate("OrgCases")}
          >
            <Activity size={20} color="#0EA5E9" />
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active Cases</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statCard, { borderLeftColor: "#8B5CF6" }]}
            onPress={() => navigation.navigate("OrgCases")}
          >
            <ClipboardList size={20} color="#8B5CF6" />
            <Text style={styles.statValue}>{stats.lab}</Text>
            <Text style={styles.statLabel}>Lab Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statCard, { borderLeftColor: "#10B981" }]}
            onPress={() => navigation.navigate("OrgCases")}
          >
            <Stethoscope size={20} color="#10B981" />
            <Text style={styles.statValue}>{stats.checkup}</Text>
            <Text style={styles.statLabel}>Checkups</Text>
          </TouchableOpacity>
        </View>



        {/* Clinical Staff Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Clinical Staff</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{doctors.length}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("OrgDoctors")}>
              <Text style={styles.seeAll}>Manage Staff</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.doctorScroll}
          >
            {doctors.map((dr) => (
              <TouchableOpacity 
                key={dr.id} 
                style={styles.drCard}
                onPress={() => navigation.navigate("OrgDoctors")}
              >
                <View style={styles.drAvatar}>
                  {dr.avatar_url ? (
                    <Image source={{ uri: dr.avatar_url }} style={styles.drAvatarImage} />
                  ) : (
                    <Text style={styles.drAvatarText}>{dr.full_name?.charAt(0)}</Text>
                  )}
                </View>
                <Text style={styles.drName} numberOfLines={1}>{dr.full_name}</Text>
                <Text style={styles.drSpecialty}>Doctor</Text>
                <View style={styles.drStatus}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </TouchableOpacity>
            ))}
            {doctors.length === 0 && (
              <View style={styles.emptyDr}>
                <Text style={styles.emptyText}>No approved doctors found.</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Recent Organization Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Cases</Text>
            <TouchableOpacity onPress={() => navigation.navigate("OrgCases")}>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            {recentCases.map((c, i) => (
              <TouchableOpacity 
                key={c.id} 
                style={[styles.activityItem, i === recentCases.length - 1 && styles.noBorder]}
                onPress={() => navigation.navigate("Patients", { screen: "PatientDetail", params: { id: c.id } })}
              >
                <View style={[styles.activityIcon, { backgroundColor: c.is_urgent ? "#FEF2F2" : "#F0F9FF" }]}>
                  {c.is_urgent ? <AlertCircle size={16} color="#EF4444" /> : <FileText size={16} color="#0EA5E9" />}
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{c.patient_name}</Text>
                  <Text style={styles.activityDesc}>By {c.doctor_name || "Doctor"}</Text>
                </View>
                <View style={styles.activityMeta}>
                  <Text style={styles.activityTime}>{new Date(c.created_at).toLocaleDateString()}</Text>
                  <ChevronRight size={14} color="#94A3B8" />
                </View>
              </TouchableOpacity>
            ))}
            {recentCases.length === 0 && (
              <View style={styles.emptyActivity}>
                <Text style={styles.emptyText}>No recent activity found.</Text>
              </View>
            )}
          </View>
        </View>

        {/* AI Model & Procedures Admin Card */}
        <View style={styles.adminCard}>
          <View style={styles.adminHeader}>
            <Activity size={18} color="#8B5CF6" />
            <Text style={styles.adminTitle}>AI Model & Procedures Admin Panel</Text>
          </View>

          {loadingModelInfo && (
            <View style={styles.adminLoadingRow}>
              <ActivityIndicator size="small" color="#8B5CF6" />
              <Text style={styles.adminLoadingText}>Fetching model statistics...</Text>
            </View>
          )}

          {modelInfoError && !loadingModelInfo && (
            <View style={styles.adminErrorRow}>
              <AlertCircle size={16} color="#EF4444" />
              <Text style={styles.adminErrorText}>{modelInfoError}</Text>
              <TouchableOpacity onPress={loadModelInfo}>
                <RefreshCw size={14} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
          )}

          {modelInfo && !loadingModelInfo && (
            <View style={styles.modelInfoSection}>
              <Text style={styles.modelSectionTitle}>Current Model Configuration</Text>
              <View style={styles.metaGrid}>
                <View style={styles.metaBox}>
                  <Text style={styles.metaLabel}>Best Model</Text>
                  <Text style={styles.metaValue}>{modelInfo.best_model || "None"}</Text>
                </View>
                <View style={styles.metaBox}>
                  <Text style={styles.metaLabel}>Accuracy</Text>
                  <Text style={styles.metaValue}>
                    {modelInfo.accuracy ? `${(modelInfo.accuracy * 100).toFixed(1)}%` : "N/A"}
                  </Text>
                </View>
                <View style={styles.metaBox}>
                  <Text style={styles.metaLabel}>Training Rows</Text>
                  <Text style={styles.metaValue}>{modelInfo.total_training_rows ?? 0}</Text>
                </View>
                <View style={styles.metaBox}>
                  <Text style={styles.metaLabel}>Unique Classes</Text>
                  <Text style={styles.metaValue}>{modelInfo.total_classes ?? 0}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.adminActions}>
            <TouchableOpacity 
              style={[styles.adminBtn, styles.btnOutline]} 
              onPress={handlePickDocument}
              disabled={uploadingCsv}
            >
              {uploadingCsv ? (
                <ActivityIndicator size="small" color="#8B5CF6" />
              ) : (
                <>
                  <Upload size={14} color="#8B5CF6" />
                  <Text style={styles.btnOutlineText}>Upload Document (PDF/Word/CSV)</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.adminBtn, styles.btnOutline]} 
              onPress={() => setAddStepModalVisible(true)}
            >
              <Plus size={14} color="#8B5CF6" />
              <Text style={styles.btnOutlineText}>Add Step</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.adminBtn, styles.btnSolid]} 
              onPress={handleRetrain}
              disabled={retraining}
            >
              {retraining ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <RefreshCw size={14} color="#FFFFFF" />
                  <Text style={styles.btnSolidText}>Retrain ML Model</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Step Modal */}
        <Modal visible={addStepModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { maxHeight: "85%" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <Text style={styles.modalTitle}>Add Procedure Step</Text>
                <TouchableOpacity onPress={() => setAddStepModalVisible(false)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 14, paddingBottom: 20 }}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Procedure Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Complete Denture, FPD"
                    value={newProcName}
                    onChangeText={setNewProcName}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Subtype (Optional)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Metal Ceramic, Manual"
                    value={newProcSubtype}
                    onChangeText={setNewProcSubtype}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Current Step *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Casting, Wax Pattern"
                    value={newProcCurrent}
                    onChangeText={setNewProcCurrent}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Next Step *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Finishing and Polishing, Completed"
                    value={newProcNext}
                    onChangeText={setNewProcNext}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.formSubmitBtn, savingNewStep && { opacity: 0.7 }]}
                  onPress={handleSaveStep}
                  disabled={savingNewStep}
                >
                  {savingNewStep ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.formSubmitBtnText}>Save Step Transition</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Analytics Card */}
        <TouchableOpacity style={styles.analyticsCard}>
          <View style={styles.analyticsHeader}>
            <TrendingUp size={24} color="#FFFFFF" />
            <Text style={styles.analyticsTitle}>Real-time Insights</Text>
          </View>
          <Text style={styles.analyticsText}>
            You have <Text style={{fontWeight: '700', color: '#FFFFFF'}}>{stats.active} active cases</Text> being handled by <Text style={{fontWeight: '700', color: '#FFFFFF'}}>{doctors.length} staff members</Text>. 
            {stats.lab > 0 ? ` There are ${stats.lab} pending lab results to review.` : " All lab results are up to date."}
          </Text>
          <TouchableOpacity 
            style={styles.analyticsButton}
            onPress={() => navigation.navigate("OrgReports")}
          >
            <Text style={styles.analyticsButtonText}>Detailed Reports</Text>
          </TouchableOpacity>
        </TouchableOpacity>

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
              <View style={[styles.roleBadge, styles.roleBadgeOrg]}>
                <Text style={[styles.roleBadgeText, { color: "#64748B" }]}>ORGANIZATION</Text>
              </View>
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
                <Camera size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to change logo</Text>

            <ScrollView 
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
            >
              {/* Organization Name field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Organization Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter organization name"
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
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 24,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    gap: 2,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtext: {
    fontSize: 13,
    color: "#64748B",
  },
  welcomeCard: {
    backgroundColor: "#0EA5E9",
    borderRadius: 28,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginVertical: 4,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 6,
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  welcomeIconBox: {
    width: 64,
    height: 64,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderLeftWidth: 4,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0EA5E9",
  },
  badge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  doctorScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  drCard: {
    width: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  drAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#0EA5E915",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  drAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0EA5E9",
  },
  drAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 16,
  },
  drName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  drSpecialty: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    textAlign: "center",
  },
  drStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  statusText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
  },
  activityList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  activityDesc: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activityTime: {
    fontSize: 11,
    color: "#94A3B8",
  },
  analyticsCard: {
    backgroundColor: "#0F172A",
    borderRadius: 28,
    padding: 24,
    gap: 12,
  },
  analyticsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  analyticsText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 20,
  },
  analyticsButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  analyticsButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyDr: {
    width: width - 40,
    padding: 20,
    alignItems: "center",
  },
  emptyActivity: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
  },
  approvalAlert: {
    backgroundColor: "#F0F9FF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  alertIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  alertSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  editProfileBadgeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  editProfileBadgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  dashboardAvatarContainer: {
    marginLeft: 16,
  },
  dashboardAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  dashboardAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  dashboardAvatarPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
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
  avatarHint: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 12,
  },
  // ── Admin Panel Styles ──
  adminCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
    marginBottom: 20,
  },
  adminHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 10,
  },
  adminTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  adminLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  adminLoadingText: {
    fontSize: 12,
    color: "#8B5CF6",
    fontStyle: "italic",
  },
  adminErrorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 10,
  },
  adminErrorText: {
    flex: 1,
    fontSize: 12,
    color: "#EF4444",
  },
  modelInfoSection: {
    gap: 8,
  },
  modelSectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaBox: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 2,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  metaValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  adminActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  adminBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 38,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexGrow: 1,
  },
  btnOutline: {
    backgroundColor: "rgba(139, 92, 246, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  btnOutlineText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  btnSolid: {
    backgroundColor: "#8B5CF6",
  },
  btnSolidText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // ── Form Modal Styles ──
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  formInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: "#0F172A",
  },
  formSubmitBtn: {
    backgroundColor: "#8B5CF6",
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  formSubmitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  // ── Add Step Modal Styles ──
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
});

export default OrgDashboard;
