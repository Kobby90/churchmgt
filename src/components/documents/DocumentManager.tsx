import React from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { 
  File, 
  Upload, 
  FolderPlus, 
  Download,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { SelectItem } from '@/components/ui/select';

export function DocumentManager() {
  const { 
    documents, 
    categories,
    loading,
    uploadDocument,
    deleteDocument,
    createCategory
  } = useDocuments();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);

  const filteredDocuments = documents.filter(doc => 
    (selectedCategory === 'all' || doc.category_id === selectedCategory) &&
    (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     doc.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const [uploadForm, setUploadForm] = React.useState({
    title: '',
    description: '',
    category_id: '',
    file: null as File | null
  });

  const [categoryForm, setCategoryForm] = React.useState({
    name: '',
    description: ''
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) return;

    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description || '');
    formData.append('category_id', uploadForm.category_id);
    formData.append('file', uploadForm.file);

    try {
      await uploadDocument(formData);
      setUploadForm({ title: '', description: '', category_id: '', file: null });
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Failed to upload document:', error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory(categoryForm);
      setCategoryForm({ name: '', description: '' });
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            New Category
          </Button>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-48">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map(document => (
          <div 
            key={document.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-medium text-gray-900">{document.title}</h3>
                  <p className="text-sm text-gray-500">{document.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(document.file_url, '_blank')}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteDocument(document.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>
                {new Date(document.created_at).toLocaleDateString()}
              </span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {document.file_type}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document to the system. All files are securely stored.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                required
                placeholder="Enter document title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter document description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={uploadForm.category_id}
                onValueChange={(value) => setUploadForm({ ...uploadForm, category_id: value })}
              >
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">File</label>
              <Input
                required
                type="file"
                onChange={(e) => setUploadForm({ 
                  ...uploadForm, 
                  file: e.target.files?.[0] || null 
                })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>
              Create a new category to organize your documents.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                required
                placeholder="Enter category name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter category description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Create
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 