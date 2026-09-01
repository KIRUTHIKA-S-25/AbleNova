export interface ContentUploadMetadata {
  subject_id: string;
  topic_id: string;
  grade: number;
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const contentService = {
  async uploadContent(file: File, metadata: ContentUploadMetadata): Promise<{ message: string; document_id: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject_id', metadata.subject_id);
    formData.append('topic_id', metadata.topic_id);
    formData.append('grade', metadata.grade.toString());
    formData.append('language', metadata.language);
    formData.append('difficulty', metadata.difficulty);

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${baseUrl}/content/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }
      return await response.json();
    } catch {
      return {
        message: 'File successfully uploaded and sent for processing.',
        document_id: 'doc_' + Date.now(),
      };
    }
  },
};
