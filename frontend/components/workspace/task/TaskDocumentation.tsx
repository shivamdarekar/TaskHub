"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchDocumentation, saveDocumentation, setTaskDocumentation } from "@/redux/slices/documentationSlice";
import { Editor } from "@/components/blocks/editor-00/editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { SerializedEditorState } from "lexical";

interface TaskDocumentationProps {
  projectId: string;
  taskId: string;
}

export default function TaskDocumentation({ projectId, taskId }: TaskDocumentationProps) {
  const dispatch = useAppDispatch();
  const { documentation, loading: documentationLoading, taskDocumentations } = useAppSelector((state) => state.documentation);
  
  const [editorState, setEditorState] = useState<SerializedEditorState | undefined>();
  const [isSavingDoc, setIsSavingDoc] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if we have persisted documentation for this task
    const persistedDoc = taskDocumentations[taskId];
    
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
      dispatch(fetchDocumentation({ projectId, taskId }));
    }
  }, [dispatch, projectId, taskId, isInitialized, taskDocumentations]);

  useEffect(() => {
    if (documentation !== undefined && !isInitialized && !taskDocumentations[taskId]) {
      try {
        if (documentation) {
          const parsedState = JSON.parse(documentation);
          setEditorState(parsedState);
        } else {
          setEditorState(undefined);
        }
      } catch {
        setEditorState(undefined);
      }
      setIsInitialized(true);
    }
  }, [documentation, isInitialized, taskId, taskDocumentations]);

  const handleEditorChange = () => {
    setHasChanges(true);
  };

  const handleSerializedChange = (serializedState: SerializedEditorState) => {
    setEditorState(serializedState);
    setHasChanges(true);
    // Persist to Redux store immediately for local storage
    dispatch(setTaskDocumentation({ 
      taskId, 
      documentation: JSON.stringify(serializedState) 
    }));
  };

  const handleSaveDoc = async () => {
    if (!editorState) return;
    
    setIsSavingDoc(true);
    try {
      // Saving documentation
      await dispatch(saveDocumentation({ 
        projectId, 
        taskId, 
        documentation: JSON.stringify(editorState) 
      })).unwrap();
      setHasChanges(false);
      toast.success("Documentation saved successfully");
    } catch (error) {
      toast.error(typeof error === 'string' ? error : "Failed to save documentation");
    } finally {
      setIsSavingDoc(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Documentation</CardTitle>
      </CardHeader>
      <CardContent>
        <Editor
          editorSerializedState={editorState}
          onChange={handleEditorChange}
          onSerializedChange={handleSerializedChange}
          key={`${taskId}-${isInitialized}-${editorState ? 'hasState' : 'noState'}`}
        />
        <div className="flex justify-between items-center mt-4">
          {hasChanges && (
            <p className="text-sm text-muted-foreground">
              You have unsaved changes
            </p>
          )}
          <div className="ml-auto">
            <Button 
              className="bg-gray-800 hover:bg-gray-900" 
              onClick={handleSaveDoc} 
              disabled={isSavingDoc || documentationLoading || !hasChanges}
            >
              {isSavingDoc ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}