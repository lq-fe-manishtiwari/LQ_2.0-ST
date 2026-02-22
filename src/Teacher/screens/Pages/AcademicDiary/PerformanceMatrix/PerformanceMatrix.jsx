import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Edit, Trash2, Save, X, Search, PlusCircle, Check, ChevronDown, UserCheck, Users, Activity, Target, Ruler, FileText, Eye, UserX, Download } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
import { useOutletContext } from 'react-router-dom';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import Loader from '../../HRM/Components/Loader';
import { monitoringService } from '../Services/monitoring.service';
import { teacherProfileService } from '../Services/academicDiary.service';
import { Settings as MonitoringSettings } from '../../HRM/Settings/Settings.service';
import { TaskManagement } from '../../HRM/Services/TaskManagement.service';

import { useUserProfile } from '../../../../../contexts/UserProfileContext';

const PerformanceMatrix = () => {
    const userProfile = useUserProfile();
    const selectedUserId = userProfile?.getUserId();
    const collegeId = userProfile?.getCollegeId();
    // Hardcoded for Teacher context only
    const activeTab = 'teachers';
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [activities, setActivities] = useState([]);
    const [units, setUnits] = useState([]);
    const [frequencies, setFrequencies] = useState([]);
    const [authorityRoles, setAuthorityRoles] = useState([]);
    const [employeeHierarchy, setEmployeeHierarchy] = useState({});
    const [responses, setResponses] = useState({});
    const [pendingChanges, setPendingChanges] = useState({});
    const [activeRatingConfig, setActiveRatingConfig] = useState(null);

    const currentUser = useMemo(() => {
        const profile = localStorage.getItem("userProfile");
        return profile ? JSON.parse(profile) : null;
    }, []);

    const currentUserId = useMemo(() => {
        if (!currentUser) return null;
        return currentUser.userId || currentUser.id || currentUser.employeeId || currentUser.user_id;
    }, [currentUser]);

    const isSuperAdmin = useMemo(() => {
        if (!currentUser) return false;
        const directRole = String(currentUser.role || currentUser.roleName || currentUser.role_name || "").toUpperCase();
        if (directRole === 'SUPERADMIN') return true;
        if (Array.isArray(currentUser.roles)) {
            return currentUser.roles.some(r => String(r.name || r.role_name || r.roleName).toUpperCase() === 'SUPERADMIN');
        }
        return false;
    }, [currentUser]);

    const [alert, setAlert] = useState(null);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [showDocModal, setShowDocModal] = useState(false);
    const [docModalData, setDocModalData] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingActivityId, setEditingActivityId] = useState(null);
    const [formData, setFormData] = useState({ activity_name: '', target: '', unit_id: '', frequency_id: '' });

    useEffect(() => {
        if (collegeId) {
            initData();
            fetchActiveRating();
        }
    }, [collegeId]);

    useEffect(() => {
        if (selectedUserId && collegeId) {
            fetchResponses();
            fetchSelectedUserHierarchy();
        } else if (!selectedUserId) {
            setResponses({});
            setEmployeeHierarchy({});
        }
    }, [selectedUserId, collegeId, activities, authorityRoles]);

    const initData = async () => {
        setLoading(true);
        try {
            const [activityData, rolesData] = await Promise.all([
                monitoringService.getActivities(collegeId, '').catch(e => { return null; }),
                MonitoringSettings.getAuthorityRoles(collegeId).catch(e => { return null; })
            ]);

            setActivities(activityData || []);
            setAuthorityRoles(rolesData || []);
        } catch (error) {
            // Silently fail or handle gracefully
        } finally {
            setLoading(false);
        }
    };

    const fetchModalData = async () => {
        if (units.length > 0 && frequencies.length > 0) return;
        try {
            const [unitsData, frequenciesData] = await Promise.all([
                MonitoringSettings.getAllUnit(collegeId),
                MonitoringSettings.getAllFrequency(collegeId)
            ]);
            setUnits(unitsData || []);
            setFrequencies(frequenciesData || []);
        } catch (error) {
            // Silently fail
        }
    };

    const fetchActiveRating = async () => {
        try {
            const data = await MonitoringSettings.getAllRatings(collegeId);
            const active = (data || []).find(r => r.is_active);
            setActiveRatingConfig(active || null);
        } catch (error) {
            // Silently fail
        }
    };

    const fetchResponses = async () => {
        if (!activities.length || !selectedUserId) {
            return;
        }
        setLoading(true);
        try {
            const data = await monitoringService.getAppraisalsByUserId(collegeId, selectedUserId);
            const mappedResponses = {};
            (data || []).forEach(res => {
                const activity = (activities || []).find(a => a.activity_name === res.activity);
                if (activity) {
                    const activityId = activity.activity_id;
                    mappedResponses[`${activityId}_actual`] = res.actual_achievement;
                    mappedResponses[`${activityId}_id`] = res.id;

                    if (res.documents && res.documents.length > 0) {
                        mappedResponses[`${activityId}_doc`] = res.documents[0];
                        mappedResponses[`${activityId}_docs`] = res.documents;
                    }

                    if (res.final_rating) {
                        mappedResponses[`${activityId}_final_rating`] = res.final_rating;
                    }
                    if (res.final_rating_calculation) {
                        mappedResponses[`${activityId}_final_rating_calc`] = res.final_rating_calculation;
                    }

                    if (res.ratings) {
                        if (res.ratings.SELF) {
                            mappedResponses[`${activityId}_self`] = res.ratings.SELF;
                        }

                        authorityRoles.forEach(role => {
                            const roleKey = role.authority_role_id || role.id;
                            const roleName = role.authority_role_name || role.authority_role;
                            if (res.ratings[roleName]) {
                                mappedResponses[`${activityId}_${roleKey}`] = res.ratings[roleName];
                            }
                        });
                    }
                }
            });
            setResponses(mappedResponses);
        } catch (error) {
            // Silently fail
        } finally {
            setLoading(false);
        }
    };

    const fetchSelectedUserHierarchy = async () => {
        if (!selectedUserId) return;
        try {
            const data = await MonitoringSettings.getApprovalHierarchyByEmployeeId(selectedUserId);
            if (Array.isArray(data)) {
                const hierarchyMap = {};
                data.forEach(item => {
                    hierarchyMap[item.authority_role_id] = item.approval_user_id || item.approver_user_id;
                });
                setEmployeeHierarchy(hierarchyMap);
            }
        } catch (error) {
            // Silently fail
        }
    };

    const checkPermission = (field) => {
        if (!selectedUserId || !currentUserId) return false;

        const selId = Number(selectedUserId);
        const curId = Number(currentUserId);
        const isSelf = selId === curId;
        const isSuper = !!isSuperAdmin;

        if (isSuper) return true;

        if (field === 'actual' || field === 'self') {
            return isSelf;
        }

        const designatedApproverId = employeeHierarchy[field];
        const isDesignated = designatedApproverId && Number(designatedApproverId) === curId;

        return !!isDesignated;
    };

    // Note: Local fetching of teacher names for hierarchy labels is skipped and handled dynamically in the UI
    const handleOpenAddModal = async () => {
        setIsEditing(false);
        setFormData({ activity_name: '', target: '', unit_id: '', frequency_id: '' });
        setShowActivityModal(true);
        await fetchModalData();
    };

    const handleOpenEditModal = async (activity) => {
        setIsEditing(true);
        const target = activity.teacher_target;
        const freqId = activity.teacher_frequencies;
        const unitId = activity.teacher_unit_measurement;

        setFormData({
            activity_name: activity.activity_name,
            target: target || '',
            unit_id: unitId || '',
            frequency_id: freqId || ''
        });
        setEditingActivityId(activity.activity_id);
        setShowActivityModal(true);
        await fetchModalData();
    };

    const handleAddOrUpdate = async () => {
        if (!formData.activity_name.trim()) return;
        try {
            const payload = {
                activity_name: formData.activity_name,
                college_id: collegeId,
                teacher_target: formData.target,
                teacher_unit_measurement: parseInt(formData.unit_id) || null,
                teacher_frequencies: parseInt(formData.frequency_id) || null,
            };

            if (isEditing) {
                await monitoringService.addActivity({ ...payload, id: editingActivityId, activity_id: editingActivityId });
            } else {
                await monitoringService.addActivity({ ...payload, id: null });
            }

            setAlert(<SweetAlert success title="Success!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>{isEditing ? 'Indicator updated' : 'Indicator added'} successfully.</SweetAlert>);
            setShowActivityModal(false);
            initData();
        } catch (error) {
            setAlert(<SweetAlert error title="Error!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>Failed to save.</SweetAlert>);
        }
    };

    const handleDeleteActivity = (id) => {
        setAlert(
            <SweetAlert
                warning
                showCancel
                confirmBtnText="Yes, delete it!"
                confirmBtnBsStyle="danger"
                confirmBtnCssClass="btn-confirm"
                cancelBtnCssClass="btn-cancel"
                title="Are you sure?"
                onConfirm={async () => {
                    try {
                        await monitoringService.deleteActivity(id);
                        setAlert(<SweetAlert success title="Deleted!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>Deleted successfully.</SweetAlert>);
                        initData();
                    } catch (error) {
                        setAlert(<SweetAlert error title="Error!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>Failed to delete.</SweetAlert>);
                    }
                }}
                onCancel={() => setAlert(null)}
            >
                This activity will be removed from all term reports.
            </SweetAlert>
        );
    };

    const handleCellChange = (activityId, field, value) => {
        const key = `${activityId}_${field}`;
        setResponses(prev => ({ ...prev, [key]: value }));
        setPendingChanges(prev => ({ ...prev, [activityId]: true }));
    };

    const [activeDropdown, setActiveDropdown] = useState(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
    const [showCalcModal, setShowCalcModal] = useState(false);
    const [calcModalData, setCalcModalData] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadActivity, setUploadActivity] = useState(null);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [showExportDropdown, setShowExportDropdown] = useState(false);

    useEffect(() => {
        const close = () => setActiveDropdown(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    const handleRatingClick = (e, activity, role) => {
        if (e) e.stopPropagation();
        if (!checkPermission(role)) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setDropdownPos({
            top: rect.bottom + window.scrollY + 4,
            left: rect.left + window.scrollX
        });
        setActiveDropdown({ activityId: activity.activity_id, roleKey: role });
    };

    const handleRatingSelect = (activityId, roleKey, value) => {
        handleCellChange(activityId, roleKey, value);
        setActiveDropdown(null);
    };

    const handleFileUpload = async (e, activityId) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingDoc(true);
        try {
            const text = await TaskManagement.uploadFileToS3(file);
            let result;
            try {
                const parsed = JSON.parse(text);
                result = parsed.response || parsed.url || text.trim();
            } catch {
                result = text.trim();
            }
            if (typeof result === 'string') {
                result = result.replace(/^["']|["']$/g, '').trim();
            }
            setResponses(prev => {
                const existing = prev[`${activityId}_docs`] || [];
                return {
                    ...prev,
                    [`${activityId}_doc`]: result,
                    [`${activityId}_docs`]: [result, ...existing]
                };
            });
            setPendingChanges(prev => ({ ...prev, [activityId]: true }));
        } catch (error) {
            setAlert(<SweetAlert error title="Error!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>Document upload failed.</SweetAlert>);
        } finally {
            setUploadingDoc(false);
        }
    };

    const getEvidenceDocs = () => {
        const docs = [];
        filteredActivities.forEach(a => {
            const activityDocs = responses[`${a.activity_id}_docs`];
            if (activityDocs && activityDocs.length > 0) {
                activityDocs.forEach((docUrl, idx) => {
                    docs.push({
                        title: `${a.activity_name} - Doc ${idx + 1}`,
                        url: docUrl
                    });
                });
            }
        });
        return docs;
    };

    const handleExportPDF = () => {
        const collegeName = activeCollege?.name || activeCollege?.college_name || "";
        const reportTitle = "Performance Matrix Report";
        const exportColumns = [
            { key: 'Sr.', label: 'Sr.' },
            { key: 'Indicator Details', label: 'Indicator Details' },
            { key: 'Target', label: 'Target' },
            { key: 'Frequency', label: 'Frequency' },
            { key: 'Unit', label: 'Unit' },
            { key: 'Actual', label: 'Actual' },
            { key: 'Self', label: 'Self' },
            { key: 'Evidence Document', label: 'Evidence Document' },
            ...authorityRoles.map(role => ({
                key: role.authority_role || role.authority_role_name || '-',
                label: role.authority_role || role.authority_role_name || '-'
            })),
            { key: 'Final', label: 'Final' }
        ];

        const data = filteredActivities.map((a, index) => {
            const row = {
                'Sr.': index + 1,
                'Indicator Details': a.activity_name || '-',
                'Target': a.teacher_target || '-',
                'Frequency': a.frequency_name || '-',
                'Unit': a.unit_name || '-',
                'Actual': responses[`${a.activity_id}_actual`] || '-',
                'Self': responses[`${a.activity_id}_self`] || '-',
            };

            const docs = responses[`${a.activity_id}_docs`];
            if (docs && docs.length > 0) {
                row['Evidence Document'] = docs.map((url, i) => `Document ${i + 1}`).join('\n');
            } else {
                row['Evidence Document'] = '-';
            }

            authorityRoles.forEach(role => {
                const roleId = role.id || role.authority_role_id;
                row[role.authority_role || role.authority_role_name || '-'] = responses[`${a.activity_id}_${roleId}`] || '-';
            });
            row['Final'] = responses[`${a.activity_id}_final_rating`] || '-';
            return row;
        });

        const doc = new jsPDF('landscape');
        const pageWidth = doc.internal.pageSize.width;
        doc.setFontSize(16);
        doc.text(collegeName, pageWidth / 2, 15, { align: 'center' });
        doc.setFontSize(14);
        doc.text(reportTitle, pageWidth / 2, 22, { align: 'center' });

        const headers = [exportColumns.map(col => col.label)];
        const bodyRows = data.map(item => exportColumns.map(col => item[col.key]));

        let currentY = 30;

        autoTable(doc, {
            head: headers,
            body: bodyRows,
            startY: currentY,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] },
            styles: { fontSize: 8 },
            didParseCell: function (data) {
                if (data.column.index === 7 && data.section === 'body') {
                    const rowData = filteredActivities[data.row.index];
                    const docs = responses[`${rowData.activity_id}_docs`];
                    if (docs && docs.length > 0) {
                        data.cell.styles.textColor = [37, 99, 235];
                    }
                }
            },
            didDrawCell: function (data) {
                if (data.column.index === 7 && data.section === 'body') {
                    const rowData = filteredActivities[data.row.index];
                    const docs = responses[`${rowData.activity_id}_docs`];
                    if (docs && docs.length > 0) {
                        try {
                            const paddingLeft = data.cell.padding('left') || 2;
                            const paddingTop = data.cell.padding('top') || 2;
                            const lineHeight = (data.row.height - paddingTop * 2) / Math.max(1, docs.length);
                            docs.forEach((url, i) => {
                                const yPos = data.cell.y + paddingTop + (i * lineHeight);
                                doc.link(data.cell.x + paddingLeft, yPos, data.cell.width - paddingLeft * 2, lineHeight, { url: url });
                            });
                        } catch (e) {
                            // Silently fail
                        }
                    }
                }
            },
            didDrawPage: (data) => {
                currentY = data.cursor.y;
            }
        });


        doc.save(`Performance_Matrix_${new Date().toISOString().split('T')[0]}.pdf`);
        setShowExportDropdown(false);
    };

    const handleExportExcel = async () => {
        const collegeName = activeCollege?.name || activeCollege?.college_name || "";
        const reportTitle = "Performance Matrix Report";
        const exportColumns = [
            { key: 'Sr.', label: 'Sr.' },
            { key: 'Indicator Details', label: 'Indicator Details' },
            { key: 'Target', label: 'Target' },
            { key: 'Frequency', label: 'Frequency' },
            { key: 'Unit', label: 'Unit' },
            { key: 'Actual', label: 'Actual' },
            { key: 'Self', label: 'Self' },
            { key: 'Evidence Document', label: 'Evidence Document' },
            ...authorityRoles.map(role => ({
                key: role.authority_role || role.authority_role_name || '-',
                label: role.authority_role || role.authority_role_name || '-'
            })),
            { key: 'Final', label: 'Final' }
        ];

        const data = filteredActivities.map((a, index) => {
            const row = {
                'Sr.': index + 1,
                'Indicator Details': a.activity_name || '-',
                'Target': a.teacher_target || '-',
                'Frequency': a.frequency_name || '-',
                'Unit': a.unit_name || '-',
                'Actual': responses[`${a.activity_id}_actual`] || '-',
                'Self': responses[`${a.activity_id}_self`] || '-',
            };

            const docs = responses[`${a.activity_id}_docs`];
            if (docs && docs.length > 0) {
                row['Evidence Document'] = docs; // Keep the array of URLs for later processing
            } else {
                row['Evidence Document'] = '-';
            }

            authorityRoles.forEach(role => {
                const roleId = role.id || role.authority_role_id;
                row[role.authority_role || role.authority_role_name || '-'] = responses[`${a.activity_id}_${roleId}`] || '-';
            });
            row['Final'] = responses[`${a.activity_id}_final_rating`] || '-';
            return row;
        });

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Performance Matrix');

            const titleRow0 = worksheet.addRow([collegeName]);
            worksheet.mergeCells(1, 1, 1, exportColumns.length);
            titleRow0.getCell(1).font = { size: 16, bold: true };
            titleRow0.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

            const titleRow = worksheet.addRow([reportTitle]);
            worksheet.mergeCells(2, 1, 2, exportColumns.length);
            titleRow.getCell(1).font = { size: 14, bold: true };
            titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
            worksheet.addRow([]);

            const headers = exportColumns.map(col => col.label);
            const headerRow = worksheet.addRow(headers);

            headerRow.eachCell(cell => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            });

            data.forEach(item => {
                const newRow = worksheet.addRow(exportColumns.map(col => item[col.key]));
                newRow.eachCell(cell => {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    cell.alignment.wrapText = true;
                });

                // Handle Evidence Document cell text and hyperlinks via formula
                const evidenceDocColIndex = exportColumns.findIndex(col => col.key === 'Evidence Document') + 1;
                const evidenceCell = newRow.getCell(evidenceDocColIndex);
                if (evidenceCell.value && Array.isArray(evidenceCell.value)) {
                    const docsArray = evidenceCell.value;
                    // Use only the first document for formula cell to prevent Excel corruption on multi-line formulas
                    const firstUrl = docsArray[0];
                    evidenceCell.value = {
                        formula: `HYPERLINK("${firstUrl}", "Document 1${docsArray.length > 1 ? ` (+${docsArray.length - 1} more)` : ''}")`
                    };
                    evidenceCell.font = { color: { argb: 'FF2563EB' }, underline: true };
                } else if (evidenceCell.value === '-') {
                    evidenceCell.value = '-';
                }
            });

            exportColumns.forEach((_, i) => {
                if (i === 0) worksheet.getColumn(i + 1).width = 8;
                else if (i === 1) worksheet.getColumn(i + 1).width = 35;
                else if (i === 7) worksheet.getColumn(i + 1).width = 45;
                else worksheet.getColumn(i + 1).width = 15;
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Performance_Matrix_${new Date().toISOString().split('T')[0]}.xlsx`;
            link.click();
            setShowExportDropdown(false);
        } catch (err) {
            // Silently fail
        }
    };

    const handleExportCSV = () => {
        const collegeName = activeCollege?.name || activeCollege?.college_name || "";
        const reportTitle = "Performance Matrix Report";
        const exportColumns = [
            { key: 'Sr.', label: 'Sr.' },
            { key: 'Indicator Details', label: 'Indicator Details' },
            { key: 'Target', label: 'Target' },
            { key: 'Frequency', label: 'Frequency' },
            { key: 'Unit', label: 'Unit' },
            { key: 'Actual', label: 'Actual' },
            { key: 'Self', label: 'Self' },
            { key: 'Evidence Document', label: 'Evidence Document' },
            ...authorityRoles.map(role => ({
                key: role.authority_role || role.authority_role_name || '-',
                label: role.authority_role || role.authority_role_name || '-'
            })),
            { key: 'Final', label: 'Final' }
        ];

        const data = filteredActivities.map((a, index) => {
            const row = {
                'Sr.': index + 1,
                'Indicator Details': a.activity_name || '-',
                'Target': a.teacher_target || '-',
                'Frequency': a.frequency_name || '-',
                'Unit': a.unit_name || '-',
                'Actual': responses[`${a.activity_id}_actual`] || '-',
                'Self': responses[`${a.activity_id}_self`] || '-',
            };

            const docs = responses[`${a.activity_id}_docs`];
            if (docs && docs.length > 0) {
                row['Evidence Document'] = docs.map((url, i) => `Document ${i + 1}: ${url}`).join(' | ');
            } else {
                row['Evidence Document'] = '-';
            }

            authorityRoles.forEach(role => {
                const roleId = role.id || role.authority_role_id;
                row[role.authority_role || role.authority_role_name || '-'] = responses[`${a.activity_id}_${roleId}`] || '-';
            });
            row['Final'] = responses[`${a.activity_id}_final_rating`] || '-';
            return row;
        });

        let csvContent = `"${collegeName}"\n`;
        csvContent += `"${reportTitle}"\n\n`;

        const headers = exportColumns.map(col => col.label);
        csvContent += headers.map(h => `"${h}"`).join(',') + '\n';

        data.forEach(item => {
            csvContent += exportColumns.map(col => `"${String(item[col.key] || '').replace(/"/g, '""')}"`).join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Performance_Matrix_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        setShowExportDropdown(false);
    };

    const handleSubmitAll = async () => {
        if (!selectedUserId) return;
        setSaving(true);
        try {
            const pendingActivityIds = Object.keys(pendingChanges);
            for (const activityId of pendingActivityIds) {
                const activity = activities.find(a => String(a.activity_id) === String(activityId));
                if (!activity) continue;

                const appraisalId = responses[`${activityId}_id`];
                const ratings = {};
                const selfVal = responses[`${activityId}_self`];
                if (selfVal) ratings["SELF"] = selfVal;

                authorityRoles.forEach(role => {
                    const roleId = role.authority_role_id || role.id;
                    const roleName = role.authority_role_name || role.authority_role;
                    const roleVal = responses[`${activityId}_${roleId}`];
                    if (roleVal) ratings[roleName] = roleVal;
                });

                if (appraisalId) {
                    await MonitoringSettings.updateAppraisal(appraisalId, { id: parseInt(appraisalId), ratings });
                } else {
                    await MonitoringSettings.postAppraisal({
                        college_id: parseInt(collegeId),
                        user_id: parseInt(selectedUserId),
                        activity: activity.activity_name,
                        target: String(activity.teacher_target || "0"),
                        frequency: String(activity.frequency_name || ""),
                        unit: String(activity.unit_name || ""),
                        actual_achievement: String(responses[`${activityId}_actual`] || "0"),
                        documents: responses[`${activityId}_docs`] || [],
                        ratings
                    });
                }
            }
            setPendingChanges({});
            await fetchResponses();
            setAlert(<SweetAlert success title="Synced!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>Performance Matrix updated successfully.</SweetAlert>);
        } catch (error) {
            setAlert(<SweetAlert error title="Error!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>Failed to synchronize changes.</SweetAlert>);
        } finally {
            setSaving(false);
        }
    };

    const renderMobileCard = (a, index) => (
        <div key={a.activity_id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 shadow-sm border border-blue-100">{index + 1}</span>
                    <h3 className="text-sm font-bold text-gray-900 leading-snug">{a.activity_name}</h3>
                </div>
                <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleOpenEditModal(a)} className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteActivity(a.activity_id)} className="p-2.5 text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"><Trash2 size={16} /></button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100/50">
                    <p className="text-[9px] text-gray-400 font-bold tracking-widest mb-1.5 text-center">Target</p>
                    <p className="text-xs font-extrabold text-gray-700 text-center">{a.teacher_target || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100/50 text-center flex flex-col items-center justify-center">
                    <p className="text-[9px] text-gray-400 font-bold tracking-widest mb-1.5">Evidence</p>
                    {responses[`${a.activity_id}_docs`]?.length > 0 ? (
                        <button
                            onClick={() => { setDocModalData(responses[`${a.activity_id}_docs`]); setShowDocModal(true); }}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 shadow-sm hover:bg-blue-100 transition-colors"
                        >
                            <Eye size={14} />
                        </button>
                    ) : (
                        <p className="text-xs font-extrabold text-gray-300">-</p>
                    )}
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] text-blue-600 font-bold tracking-widest flex items-center gap-1.5 ml-1"><Activity size={10} /> Actual</label>
                        <input
                            type="text"
                            className={`w-full h-11 px-4 border-2 rounded-2xl outline-none text-xs font-bold transition-all ${checkPermission('actual') ? 'border-blue-50 bg-blue-50/20 focus:border-blue-500' : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'}`}
                            value={responses[`${a.activity_id}_actual`] || ''}
                            onChange={(e) => handleCellChange(a.activity_id, 'actual', e.target.value)}
                            readOnly={!checkPermission('actual')}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] text-green-600 font-bold tracking-widest flex items-center gap-1.5 ml-1"><UserCheck size={10} /> Self</label>
                        <button
                            onClick={(e) => handleRatingClick(e, a, 'self')}
                            disabled={!checkPermission('self')}
                            className={`w-full h-11 px-4 rounded-2xl text-xs font-bold transition-all border flex items-center justify-between ${responses[`${a.activity_id}_self`] ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-100 text-gray-400'} ${!checkPermission('self') && 'opacity-50 grayscale cursor-not-allowed'}`}
                        >
                            {responses[`${a.activity_id}_self`] || 'Rate'}
                            <ChevronDown size={12} />
                        </button>
                    </div>
                </div>
                {authorityRoles.length > 0 && (
                    <div className="pt-2">
                        <label className="text-[10px] text-gray-400 font-black tracking-widest  block mb-3">Authority Appraisals</label>
                        <div className="grid grid-cols-2 gap-3">
                            {authorityRoles.map((role) => {
                                const roleId = role.authority_role_id || role.id;
                                const val = responses[`${a.activity_id}_${roleId}`];
                                const hasAccess = checkPermission(roleId);
                                return (
                                    <div key={roleId} className="space-y-1">
                                        <div className="flex items-center justify-between px-1">
                                            <span className="text-[9px] font-bold text-gray-400 truncate">{role.authority_role_name}</span>
                                        </div>
                                        <button
                                            onClick={(e) => handleRatingClick(e, a, roleId)}
                                            disabled={!hasAccess}
                                            className={`w-full py-2.5 rounded-xl text-xs font-black transition-all border flex items-center justify-between px-3 ${val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-100'} ${!hasAccess && 'opacity-50 grayscale cursor-not-allowed'}`}
                                        >
                                            {val || '-'}
                                            <ChevronDown size={10} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const filteredActivities = activities.filter(a => a.activity_name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!selectedUserId) {
        return (
            <div className="flex flex-col items-center justify-center p-24 bg-white rounded-3xl border border-gray-100 shadow-sm mx-4 mt-8">
                <UserX size={48} className="text-gray-200 mb-4" />
                <h3 className="text-gray-900 font-bold text-sm">Please Log In</h3>
                <p className="text-gray-400 text-xs mt-2">You must be logged in to view the matrix.</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center bg-transparent min-h-screen">
            <div className="w-full px-4 mt-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-visible z-10">
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">Performance Matrix (API)</h1>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type="text" placeholder="Search Indicators..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-100 outline-none w-48 sm:w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <button onClick={handleOpenAddModal} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md flex items-center gap-2"><PlusCircle size={16} /> Add Indicator</button>
                            {filteredActivities.length > 0 && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold transition-colors shadow-md hover:bg-green-700"
                                    >
                                        <Download size={16} /> Export
                                        <ChevronDown size={14} className={`transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showExportDropdown && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                            <button onClick={handleExportPDF} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-100">
                                                <Download size={14} className="text-red-500" /> Export as PDF
                                            </button>
                                            <button onClick={handleExportExcel} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-100">
                                                <Download size={14} className="text-green-600" /> Export as Excel
                                            </button>
                                            <button onClick={handleExportCSV} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                                <Download size={14} className="text-gray-500" /> Export as CSV
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-4 mt-4 mb-20">
                {loading ? (
                    <div className="p-24 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <Loader size="lg" className="mx-auto mb-4" />
                        <p className="text-gray-500 font-bold text-[10px] tracking-widest animate-pulse">Loading Matrix...</p>
                    </div>
                ) : filteredActivities.length === 0 ? (
                    <div className="p-24 text-center flex flex-col items-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <Activity size={48} className="text-gray-100 mb-4" />
                        <p className="text-[10px] font-bold text-gray-400 tracking-widest text-center">No indicators found</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse min-w-[1400px]">
                                    <thead>
                                        <tr className="bg-primary-600 text-white">
                                            <th rowSpan="2" className="px-6 py-5 text-left text-[10px] font-bold tracking-widest border-b border-white/10 w-[60px]">Sr.</th>
                                            <th rowSpan="2" className="px-6 py-5 text-left text-[10px] font-bold tracking-widest border-b border-white/10 min-w-[250px]">Indicator Details</th>
                                            <th rowSpan="2" className="px-4 py-5 text-center text-[10px] font-bold tracking-widest border-b border-white/10 min-w-[80px]">Target</th>
                                            <th rowSpan="2" className="px-6 py-5 text-center text-[10px] font-bold tracking-widest border-b border-white/10 min-w-[110px]">Frequency</th>
                                            <th rowSpan="2" className="px-6 py-5 text-center text-[10px] font-bold tracking-widest border-b border-white/10 min-w-[170px]">Unit</th>
                                            <th rowSpan="2" className="px-4 py-5 text-center text-[10px] font-bold tracking-widest border-b border-white/10 min-w-[90px]">Actual</th>
                                            <th rowSpan="2" className="px-6 py-5 text-center text-[10px] font-bold tracking-widest border-b border-white/10 min-w-[180px]">Self</th>
                                            <th colSpan={authorityRoles.length} className="px-4 py-5 text-center text-[10px] font-bold tracking-widest border-b border-white/10">Authority Appraisals</th>
                                            <th rowSpan="2" className="px-6 py-5 text-center text-[10px] font-bold tracking-widest border-b border-white/10 min-w-[140px]">Final</th>
                                            <th rowSpan="2" className="px-6 py-5 text-center text-[10px] font-bold tracking-widest border-b border-white/10 w-[100px]">Actions</th>
                                        </tr>
                                        <tr className="bg-primary-600 text-white">
                                            {authorityRoles.map(role => (
                                                <th key={role.id || role.authority_role_id} className="px-3 py-4 text-center border-b border-white/10 min-w-[120px]">
                                                    <div className="text-[9px] font-bold tracking-widest mb-0.5">{role.authority_role || "-"}</div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredActivities.map((a, idx) => (
                                            <tr key={a.activity_id} className="hover:bg-blue-50/20 transition-colors group">
                                                <td className="px-6 py-4 text-xs font-bold text-gray-400">{idx + 1}</td>
                                                <td className="px-6 py-5">
                                                    <p className="text-sm font-bold text-gray-900 leading-snug">{a.activity_name}</p>
                                                </td>
                                                <td className="px-4 py-5 text-center text-xs font-extrabold text-blue-600 bg-blue-50/5">{a.teacher_target || '-'}</td>
                                                <td className="px-4 py-5 text-center">
                                                    <span className="text-[10px] font-bold text-gray-500 tracking-tighter bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">{a.frequency_name || '-'}</span>
                                                </td>
                                                <td className="px-4 py-5 text-center">
                                                    <span className="text-[10px] font-bold text-gray-500 tracking-tighter bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">{a.unit_name || '-'}</span>
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input type="text" className={`w-full h-9 bg-transparent text-center text-xs font-bold outline-none focus:bg-white rounded-lg transition-all ${checkPermission('actual') ? 'text-blue-700' : 'text-gray-300 cursor-not-allowed'}`} value={responses[`${a.activity_id}_actual`] || ''} onChange={(e) => handleCellChange(a.activity_id, 'actual', e.target.value)} readOnly={!checkPermission('actual')} placeholder="0" />
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={(e) => handleRatingClick(e, a, 'self')} disabled={!checkPermission('self')} className={`flex-1 h-9 flex items-center justify-between px-3 border rounded-xl text-xs font-bold transition-all ${responses[`${a.activity_id}_self`] ? 'bg-green-50 border-green-200 text-green-700 shadow-sm' : 'bg-white border-gray-200 text-gray-400 font-medium'} ${!checkPermission('self') && 'opacity-50 grayscale cursor-not-allowed'}`}>
                                                            <span className="truncate mr-1">{responses[`${a.activity_id}_self`] || "Rate"}</span>
                                                            <ChevronDown size={14} className="shrink-0 opacity-50" />
                                                        </button>
                                                        <button onClick={() => { setUploadActivity(a); setShowUploadModal(true); }} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all shrink-0 ${responses[`${a.activity_id}_docs`]?.length > 0 ? 'text-blue-600' : 'text-gray-400'}`} title="Evidence Docs">
                                                            {responses[`${a.activity_id}_docs`]?.length > 0 ? <Eye size={16} /> : <FileText size={16} />}
                                                        </button>
                                                    </div>
                                                </td>
                                                {authorityRoles.map(role => {
                                                    const roleId = role.authority_role_id || role.id;
                                                    const val = responses[`${a.activity_id}_${roleId}`];
                                                    const hasAccess = checkPermission(roleId);
                                                    return (
                                                        <td key={roleId} className="px-2 py-5 text-center">
                                                            <button onClick={(e) => handleRatingClick(e, a, roleId)} disabled={!hasAccess} className={`min-w-[100px] h-9 mx-auto flex items-center justify-between px-3 border rounded-xl text-xs font-bold transition-all ${val ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-gray-200 text-gray-400 font-medium'} ${!hasAccess && 'opacity-50 grayscale cursor-not-allowed'}`}>
                                                                <span className="truncate mr-1">{val || "-"}</span>
                                                                <ChevronDown size={14} className="shrink-0 opacity-50" />
                                                            </button>
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-6 py-5 text-center">
                                                    {responses[`${a.activity_id}_final_rating`] ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="text-xs font-bold text-white px-3 py-1.5 bg-green-500 rounded-lg shadow-sm whitespace-nowrap min-w-[70px] text-center">{responses[`${a.activity_id}_final_rating`]}</span>
                                                            {responses[`${a.activity_id}_final_rating_calc`] && <button onClick={() => { setCalcModalData(responses[`${a.activity_id}_final_rating_calc`]); setShowCalcModal(true); }} className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-100/50" title="View Breakdown"><Eye size={14} /></button>}
                                                        </div>
                                                    ) : <span className="text-xs font-bold text-gray-300">-</span>}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex justify-center gap-1">
                                                        <button onClick={() => handleOpenEditModal(a)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={14} /></button>
                                                        <button onClick={() => handleDeleteActivity(a.activity_id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="lg:hidden space-y-4">{filteredActivities.map((a, idx) => renderMobileCard(a, idx))}</div>
                    </>
                )}
            </div>

            {Object.keys(pendingChanges).length > 0 && (
                <div className="fixed bottom-10 left-0 right-0 z-[2000] flex justify-center pointer-events-none lg:pl-64">
                    <button onClick={handleSubmitAll} className="pointer-events-auto px-12 py-4 bg-primary-600 text-white rounded-3xl font-extrabold text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3 border border-white/20">
                        <Save size={20} /> {saving ? 'Saving...' : 'Sync Performance Matrix'}
                    </button>
                </div>
            )}

            {showActivityModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[2001] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Update Indicator' : 'Add New Indicator'}</h3>
                            <button onClick={() => setShowActivityModal(false)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 tracking-widest  ml-1">Indicator Name</label>
                                <textarea className="w-full px-4 py-3 border-2 border-gray-50 bg-gray-50/50 rounded-xl focus:border-blue-500 outline-none text-sm font-bold resize-none" rows={3} value={formData.activity_name} onChange={(e) => setFormData({ ...formData, activity_name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 tracking-widest  ml-1">Frequency</label>
                                    <select className="w-full h-11 px-4 border-2 border-gray-50 bg-gray-50/50 rounded-xl text-sm font-bold outline-none" value={formData.frequency_id} onChange={(e) => setFormData({ ...formData, frequency_id: e.target.value })}>
                                        <option value="">Select</option>
                                        {frequencies.map(f => <option key={f.id} value={f.id}>{f.frequency_name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 tracking-widest  ml-1">Unit</label>
                                    <select className="w-full h-11 px-4 border-2 border-gray-50 bg-gray-50/50 rounded-xl text-sm font-bold outline-none" value={formData.unit_id} onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}>
                                        <option value="">Select</option>
                                        {units.map(u => <option key={u.id} value={u.id}>{u.unit_name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 tracking-widest  ml-1">Target</label>
                                <input type="text" className="w-full h-11 px-4 border-2 border-gray-50 bg-gray-50/50 rounded-xl text-sm font-bold outline-none" value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} placeholder="e.g. 100" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button onClick={() => setShowActivityModal(false)} className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                            <button onClick={handleAddOrUpdate} className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">{isEditing ? 'Update Indicator' : 'Add Indicator'}</button>
                        </div>
                    </div>
                </div>
            )}

            {showUploadModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[2001] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Evidence Documents</h3>
                            <button onClick={() => setShowUploadModal(false)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            {checkPermission('actual') && (
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <input type="file" id="docUpload" className="hidden" onChange={(e) => handleFileUpload(e, uploadActivity.activity_id)} />
                                        <label htmlFor="docUpload" className="w-full h-32 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer group-hover:border-blue-400 group-hover:bg-blue-50/30 transition-all bg-gray-50/50">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 transition-transform"><Plus size={20} className="text-blue-600" /></div>
                                            <span className="text-xs font-bold text-gray-400">{uploadingDoc ? 'Uploading...' : 'Click to upload proof'}</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-3">
                                {responses[`${uploadActivity.activity_id}_docs`]?.map((doc, idx) => (
                                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <FileText size={16} className="text-blue-500" />
                                            <span className="text-[10px] font-bold text-gray-700">Doc {idx + 1}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <a href={doc} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white border rounded-lg text-blue-600"><Eye size={12} /></a>
                                            {checkPermission('self') && <button onClick={() => { setResponses(prev => { const d = [...prev[`${uploadActivity.activity_id}_docs`]]; d.splice(idx, 1); return { ...prev, [`${uploadActivity.activity_id}_docs`]: d, [`${uploadActivity.activity_id}_doc`]: d[0] || null }; }); setPendingChanges(prev => ({ ...prev, [uploadActivity.activity_id]: true })); }} className="p-1.5 bg-white border rounded-lg text-red-500"><Trash2 size={12} /></button>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeDropdown && ReactDOM.createPortal(
                <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, zIndex: 9999, minWidth: '150px' }} className="bg-white border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b bg-gray-50/50"><span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Select Rating</span></div>
                    <div className="max-h-[250px] overflow-y-auto">
                        {!activeRatingConfig ? (
                            <div className="p-4 text-[10px] text-gray-400 font-bold italic text-center">No Rating Config Active</div>
                        ) : activeRatingConfig.rating_type?.toLowerCase() === 'number' ? (
                            Array.from({ length: Math.floor(activeRatingConfig.max_value) - Math.ceil(activeRatingConfig.min_value) + 1 }, (_, i) => Math.floor(activeRatingConfig.max_value) - i).map(num => (
                                <button key={num} onClick={() => handleRatingSelect(activeDropdown.activityId, activeDropdown.roleKey, String(num))} className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-blue-50 border-b border-gray-50 last:border-0 ${String(responses[`${activeDropdown.activityId}_${activeDropdown.roleKey}`]) === String(num) ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}>Rating: {num}</button>
                            ))
                        ) : (
                            activeRatingConfig.string_values?.map((val, idx) => (
                                <button key={idx} onClick={() => handleRatingSelect(activeDropdown.activityId, activeDropdown.roleKey, val)} className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-blue-50 border-b border-gray-50 last:border-0 ${responses[`${activeDropdown.activityId}_${activeDropdown.roleKey}`] === val ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}>{val}</button>
                            ))
                        )}
                        <button onClick={() => handleRatingSelect(activeDropdown.activityId, activeDropdown.roleKey, null)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 border-t">Clear Rating</button>
                    </div>
                </div>,
                document.body
            )}

            {showCalcModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[2001] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div><h3 className="text-xl font-bold text-gray-900">Rating Breakdown</h3><p className="text-[10px] font-bold text-gray-400 tracking-widest">Weighted Score Calculation</p></div>
                            <button onClick={() => setShowCalcModal(false)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-xl transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {calcModalData?.breakdown?.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="space-y-1"><p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">{item.role}</p><p className="text-sm font-bold text-gray-900">{item.rating || 'N/A'}</p></div>
                                        <div className="text-right space-y-1"><p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Points x Weight</p><p className="text-sm font-black text-gray-900">{item.points} <span className="text-gray-300 mx-1">×</span> {item.weight}%</p></div>
                                    </div>
                                ))}
                                <div className="mt-8 p-6 bg-blue-600 rounded-3xl shadow-lg shadow-blue-200 flex items-center justify-between text-white">
                                    <div className="space-y-1"><p className="text-[10px] font-bold opacity-80 tracking-widest uppercase text-white">Final Calculated Score</p><p className="text-3xl font-black">{calcModalData?.score?.toFixed(2)}</p></div>
                                    <div className="h-12 w-[1px] bg-white/20"></div>
                                    <div className="text-right space-y-1"><p className="text-[10px] font-bold opacity-80 tracking-widest uppercase text-white">Resulting Grade</p><p className="text-2xl font-black tracking-tight">{calcModalData?.grade || 'N/A'}</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {alert}
        </div>
    );
};

export default PerformanceMatrix;
