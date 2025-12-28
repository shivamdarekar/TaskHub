"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchProjectDocumentation, saveProjectDocumentation, setProjectDocumentation } from "@/redux/slices/documentationSlice";
import { Editor } from "@/components/blocks/editor-00/editor";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EditorState, SerializedEditorState } from "lexical";

interface ProjectDocumentationProps {
  project: {
    id: string;
    name: string;
  };
  workspaceId: string;
}

export default function ProjectDocumentation({ project, workspaceId }: ProjectDocumentationProps) {
  const dispatch = useAppDispatch();
  const { loading: documentationLoading, projectDocumentations } = useAppSelector((state) => state.documentation);
  
  const [editorState, setEditorState] = useState<SerializedEditorState | undefined>();
  const [isSavingDoc, setIsSavingDoc] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if we have persisted documentation for this project
    const persistedDoc = projectDocumentations[project.id];
    
    if (persistedDoc && !isInitialized) {
      try {
        const parsedState = JSON.parse(persistedDoc);
        setEditorState(parsedState);
        setIsInitialized(true);
        return;
      } catch {
        // If persisted doc is invalid, fetch from server
      }
    }
    
    if (!isInitialized && !persistedDoc) {
      dispatch(fetchProjectDocumentation(project.id));
    }
  }, [dispatch, project.id, isInitialized, projectDocumentations]);

  useEffect(() => {
    const projectDoc = projectDocumentations[project.id];
    if (projectDoc !== undefined && !isInitialized) {
      try {
        if (projectDoc) {
          const parsedState = JSON.parse(projectDoc);
          setEditorState(parsedState);
        } else {
          setEditorState(undefined);
        }
      } catch {
        setEditorState(undefined);
      }
      setIsInitialized(true);
    }
  }, [projectDocumentations, project.id, isInitialized]);

  const handleEditorChange = (state: EditorState) => {
    setHasChanges(true);
  };

  const handleSerializedChange = (serializedState: SerializedEditorState) => {
    setEditorState(serializedState);
    setHasChanges(true);
    // Persist to Redux store immediately for local storage
    dispatch(setProjectDocumentation({ 
      projectId: project.id, 
      content: JSON.stringify(serializedState) 
    }));
  };

  const handleSaveDoc = async () => {
    if (!editorState) return;
    
    setIsSavingDoc(true);
    try {
      await dispatch(saveProjectDocumentation({ 
        projectId: project.id, 
        content: JSON.stringify(editorState) 
      })).unwrap();
      setHasChanges(false);
      toast.success("Documentation saved successfully");
    } catch (error) {
      console.error('Documentation save error:', error);
      toast.error(typeof error === 'string' ? error : "Failed to save documentation");
    } finally {
      setIsSavingDoc(false);
    }
  };

  if (documentationLoading && !isInitialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading documentation...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h1 className="text-2xl font-bold">{project.name} Documentation</h1>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <p className="text-sm text-muted-foreground">
              You have unsaved changes
            </p>
          )}
          <Button 
            onClick={handleSaveDoc}
            disabled={isSavingDoc || documentationLoading || !hasChanges}
            className="bg-gray-900 hover:bg-gray-800"
          >
            {isSavingDoc ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-6">
        <Editor
          editorSerializedState={editorState}
          onChange={handleEditorChange}
          onSerializedChange={handleSerializedChange}
          key={`${project.id}-${isInitialized}-${editorState ? 'hasState' : 'noState'}`}
        />
      </div>
    </div>
  );
}