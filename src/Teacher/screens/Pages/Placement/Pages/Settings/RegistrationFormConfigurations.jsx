import React, { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { placementService } from "../../Services/placement.service";
import SweetAlert from "react-bootstrap-sweetalert";
import { Edit, Trash2, GripVertical, Plus } from 'lucide-react';

// Simple ID generator
const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;



const FIELD_TYPES = ["text", "email", "number", "password", "date", "textarea", "select", "checkbox", "file"];

const emptyField = {
  id: "",
  label: "",
  name: "",
  type: "text",
  required: false,
  placeholder: "",
  options: [],
};

function SortableItem({ field, editField, deleteField }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between bg-white border rounded-lg p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <div className="font-medium">{field.label}</div>
          <div className="text-xs text-gray-500">
            {field.type} {field.required && "• Required"}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => editField(field)} className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => deleteField(field.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function RegistrationFormConfigurations() {
  const [fields, setFields] = useState([]);
  const [currentField, setCurrentField] = useState(emptyField);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [formTitle, setFormTitle] = useState("Campus Drive Registration Form");
  const [formDescription, setFormDescription] = useState("Please fill all required fields");
  const [submitButtonText, setSubmitButtonText] = useState("Register Now");
  const [showProgress, setShowProgress] = useState(true);
  const [collegeId, setCollegeId] = useState(null);
  const [formId, setFormId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedForms, setSavedForms] = useState([]);
  const [alert, setAlert] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    const activeCollege = JSON.parse(localStorage.getItem('activeCollege'));
    if (activeCollege?.id) {
      setCollegeId(activeCollege.id);
    }
  }, []);

  useEffect(() => {
    if (collegeId) {
      fetchFormData();
    }
  }, [collegeId]);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const response = await placementService.getRegistrationFormsByCollege(collegeId);
      console.log('Fetched Form Data:', response);
      
      // Handle different response structures
      const formsArray = response?.forms || response || [];
      const formsList = Array.isArray(formsArray) ? formsArray : [formsArray];
      setSavedForms(formsList);
      
      // Load the first form if available
      const formData = formsList[0];
      
      if (formData && formData.form_id) {
        setFormId(formData.form_id);
        setFormTitle(formData.form_object?.form_title || formData.form_title || "Campus Drive Registration Form");
        setFormDescription(formData.form_object?.form_description || formData.form_description || "Please fill all required fields");
        setSubmitButtonText(formData.form_object?.submit_button_text || formData.submit_button_text || "Register Now");
        setShowProgress(formData.form_object?.show_progress ?? formData.show_progress ?? true);
        
        // Map fields from API response
        const fieldsArray = formData.form_object?.fields || formData.fields || [];
        const mappedFields = fieldsArray.map(field => ({
          id: field.id || generateId(),
          label: field.label || field.field_label || "",
          name: field.field_name || field.name || "",
          type: field.field_type || field.type || "text",
          required: field.required ?? false,
          placeholder: field.placeholder || "",
          options: Array.isArray(field.options) ? field.options : []
        }));
        
        setFields(mappedFields);
        console.log('Form loaded successfully:', formData.form_id);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
      // Don't show error if no form exists yet
      if (!error.message?.includes('not found') && !error.message?.includes('404')) {
        Swal.fire('Info', 'No existing form found. You can create a new one.', 'info');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setCurrentField({ ...currentField, [key]: value });
  };

  const saveField = () => {
    if (!currentField.label.trim()) {
      setAlert(
        <SweetAlert
          danger
          title="Error"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Field label is required
        </SweetAlert>
      );
      return;
    }

    const field = {
      ...currentField,
      id: currentField.id || generateId(),
      name: currentField.name || currentField.label.toLowerCase().replace(/\s+/g, "_"),
    };

    if (editingFieldId) {
      setFields(fields.map(f => f.id === editingFieldId ? field : f));
      setEditingFieldId(null);
    } else {
      setFields([...fields, field]);
    }

    setCurrentField(emptyField);
  };

  const editField = (field) => {
    setCurrentField(field);
    setEditingFieldId(field.id);
  };

  const deleteField = async (fieldId) => {
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete it!"
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Are you sure?"
        onConfirm={() => {
          setFields(fields.filter(f => f.id !== fieldId));
          setAlert(
            <SweetAlert
              success
              title="Deleted!"
              confirmBtnCssClass="btn-confirm"
              onConfirm={() => setAlert(null)}
            >
              Field has been deleted.
            </SweetAlert>
          );
        }}
        onCancel={() => setAlert(null)}
        focusCancelBtn
      >
        You won't be able to revert this!
      </SweetAlert>
    );
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFields((items) => {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const loadFormForEdit = (form) => {
    setFormId(form.form_id);
    setFormTitle(form.form_object?.form_title || form.form_title || "Campus Drive Registration Form");
    setFormDescription(form.form_object?.form_description || form.form_description || "Please fill all required fields");
    setSubmitButtonText(form.form_object?.submit_button_text || form.submit_button_text || "Register Now");
    setShowProgress(form.form_object?.show_progress ?? form.show_progress ?? true);
    
    // Map fields from API response
    const fieldsArray = form.form_object?.fields || form.fields || [];
    const mappedFields = fieldsArray.map(field => ({
      id: field.id || generateId(),
      label: field.label || field.field_label || "",
      name: field.field_name || field.name || "",
      type: field.field_type || field.type || "text",
      required: field.required ?? false,
      placeholder: field.placeholder || "",
      options: Array.isArray(field.options) ? field.options : []
    }));
    
    setFields(mappedFields);
    // Reset edit state when switching forms
    setCurrentField(emptyField);
    setEditingFieldId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteForm = (formIdToDelete) => {
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete it!"
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Are you sure?"
        onConfirm={async () => {
          try {
            setLoading(true);
            setAlert(null);
            await placementService.deleteRegistrationForm(formIdToDelete);
            
            // Clear current form if it was deleted
            if (formId === formIdToDelete) {
              setFormId(null);
              setFields([]);
              setFormTitle("Campus Drive Registration Form");
              setFormDescription("Please fill all required fields");
              setSubmitButtonText("Register Now");
              setShowProgress(true);
            }
            
            // Refresh the forms list
            await fetchFormData();
            
            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                onConfirm={() => setAlert(null)}
              >
                Form has been deleted.
              </SweetAlert>
            );
          } catch (error) {
            console.error('Delete Form Error:', error);
            setAlert(
              <SweetAlert
                danger
                title="Error"
                confirmBtnCssClass="btn-confirm"
                onConfirm={() => setAlert(null)}
              >
                {error.message || 'Failed to delete form'}
              </SweetAlert>
            );
          } finally {
            setLoading(false);
          }
        }}
        onCancel={() => setAlert(null)}
        focusCancelBtn
      >
        You won't be able to revert this!
      </SweetAlert>
    );
  };

  const createNewForm = () => {
    setFormId(null);
    setFields([]);
    setFormTitle("Campus Drive Registration Form");
    setFormDescription("Please fill all required fields");
    setSubmitButtonText("Register Now");
    setShowProgress(true);
    // Reset edit state when creating new form
    setCurrentField(emptyField);
    setEditingFieldId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveForm = () => {
    if (!collegeId) {
      setAlert(
        <SweetAlert
          danger
          title="Error"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          College ID not found
        </SweetAlert>
      );
      return;
    }

    if (!formTitle.trim()) {
      setAlert(
        <SweetAlert
          danger
          title="Error"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Form title is required
        </SweetAlert>
      );
      return;
    }

    if (fields.length === 0) {
      setAlert(
        <SweetAlert
          danger
          title="Error"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Please add at least one field
        </SweetAlert>
      );
      return;
    }

    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText={formId ? 'Yes, update it!' : 'Yes, create it!'}
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Save Form?"
        onConfirm={async () => {
          setLoading(true);
          setAlert(null);
          console.log("Saving form with collegeId:", collegeId);
          try {
            const formData = {
              fields: fields.map(f => ({
                field_name: f.name,
                field_type: f.type,
                label: f.label,
                required: f.required,
                placeholder: f.placeholder || "",
                options: f.options || []
              })),
              form_title: formTitle,
              form_description: formDescription,
              submit_button_text: submitButtonText,
              show_progress: showProgress
            };

            if (formId) {
              await placementService.updateRegistrationForm(formId, collegeId, formData);
              await fetchFormData();
              setAlert(
                <SweetAlert
                  success
                  title="Success"
                  confirmBtnCssClass="btn-confirm"
                  onConfirm={() => setAlert(null)}
                >
                  Form updated successfully
                </SweetAlert>
              );
            } else {
              const response = await placementService.createRegistrationForm(collegeId, formData);
              setFormId(response.form_id);
              await fetchFormData();
              setAlert(
                <SweetAlert
                  success
                  title="Success"
                  confirmBtnCssClass="btn-confirm"
                  onConfirm={() => setAlert(null)}
                >
                  Form created successfully
                </SweetAlert>
              );
            }
          } catch (error) {
            console.error("Save Form Error:", error);
            setAlert(
              <SweetAlert
                danger
                title="Error"
                confirmBtnCssClass="btn-confirm"
                onConfirm={() => setAlert(null)}
              >
                {error.message || "Failed to save form"}
              </SweetAlert>
            );
          } finally {
            setLoading(false);
          }
        }}
        onCancel={() => setAlert(null)}
        focusCancelBtn
      >
        {formId ? "Update the registration form configuration?" : "Create new registration form configuration?"}
      </SweetAlert>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {alert}
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      )}
      
      {/* Saved Forms List */}
      {savedForms.length > 0 && (
        <div className="mb-6 bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-xl text-gray-900">Saved Registration Forms</h2>
            <button
              onClick={createNewForm}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Create New</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {savedForms.map((form) => (
              <div
                key={form.form_id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  formId === form.form_id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {form.form_object?.form_title || form.form_title || 'Untitled Form'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {form.form_object?.form_description || form.form_description || 'No description'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Form ID: {form.form_id} • Fields: {(form.form_object?.fields || form.fields || []).length}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => loadFormForEdit(form)}
                    className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                    title="Edit Form"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteForm(form.form_id)}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                    title="Delete Form"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100 p-6">
        <h2 className="font-bold text-xl text-blue-900 mb-4">Form Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Form Title <span className="text-red-500">*</span></label>
            <input className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Submit Button Text</label>
            <input className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={submitButtonText} onChange={(e) => setSubmitButtonText(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Form Description</label>
            <textarea className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={2} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 text-blue-600" checked={showProgress} onChange={(e) => setShowProgress(e.target.checked)} />
            <span className="text-sm font-medium text-gray-700">Show Progress Bar</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
            {editingFieldId ? "Edit Field" : "Add Field"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Field Label <span className="text-red-500">*</span></label>
              <input className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={currentField.label} onChange={(e) => handleChange("label", e.target.value)} placeholder="e.g. First Name" required />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Field Name (key)</label>
              <input className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={currentField.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="first_name" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Field Type</label>
              <select className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={currentField.type} onChange={(e) => handleChange("type", e.target.value)}>
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {currentField.type !== "checkbox" && currentField.type !== "file" && (
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Placeholder</label>
                <input className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={currentField.placeholder} onChange={(e) => handleChange("placeholder", e.target.value)} />
              </div>
            )}

            {currentField.type === "select" && (
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Options</label>
                <textarea className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Admin, User, Manager" value={(Array.isArray(currentField.options) ? currentField.options : []).join(",")} onChange={(e) => handleChange("options", e.target.value.split(",").map((o) => o.trim()))} />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-blue-600" checked={currentField.required} onChange={(e) => handleChange("required", e.target.checked)} />
              <span className="text-sm font-medium text-gray-700">Required field</span>
            </label>

            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg py-2.5 hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-md" onClick={saveField}>
              {editingFieldId ? "Update Field" : "Add Field"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b-2 border-green-500">Form Fields</h2>

          {fields.length === 0 ? (
            <p className="text-gray-500 italic text-center py-8">No fields added yet</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {fields.map((field) => (
                    <SortableItem key={field.id} field={field} editField={editField} deleteField={deleteField} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b-2 border-purple-500">Live Preview</h2>

          {fields.length === 0 ? (
            <p className="text-gray-500 italic text-center py-8">Add fields to preview</p>
          ) : (
            <div className="space-y-4">
              {fields.map((field, i) => (
                <div key={i} className="space-y-2">
                  <label className="font-semibold text-gray-700">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === "textarea" && (
                    <textarea className="w-full border-2 border-gray-300 rounded-lg px-3 py-2" placeholder={field.placeholder} />
                  )}

                  {field.type === "select" && (
                    <select className="w-full border-2 border-gray-300 rounded-lg px-3 py-2">
                      <option>Select</option>
                      {(Array.isArray(field.options) ? field.options : []).map((o, idx) => (
                        <option key={idx}>{o}</option>
                      ))}
                    </select>
                  )}

                  {field.type === "checkbox" && (
                    <input type="checkbox" className="h-4 w-4" />
                  )}

                  {field.type === "file" && (
                    <input type="file" className="w-full" />
                  )}

                  {field.type !== "textarea" && field.type !== "select" && field.type !== "checkbox" && field.type !== "file" && (
                    <input type={field.type} className="w-full border-2 border-gray-300 rounded-lg px-3 py-2" placeholder={field.placeholder} />
                  )}
                </div>
              ))}

              <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg py-2.5 hover:from-green-600 hover:to-emerald-600 font-semibold shadow-md">
                {submitButtonText}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button onClick={saveForm} disabled={loading} className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 font-bold shadow-lg transition">
          {loading ? "Saving..." : formId ? "Update Form" : "Save Form"}
        </button>
      </div>
    </div>
  );
}
