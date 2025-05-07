import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  PaintBucket,
  Type,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  minHeight = '200px',
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  
  // Initialize the editor with content
  const initEditor = useCallback(() => {
    if (editorRef.current && value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);
  
  // Update parent component when content changes
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };
  
  // Apply formatting
  const formatDoc = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };
  
  // Insert link
  const insertLink = () => {
    if (linkUrl) {
      const text = linkText || linkUrl;
      formatDoc('insertHTML', `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`);
      setShowLinkPopover(false);
      setLinkUrl('');
      setLinkText('');
    }
  };
  
  // Insert image from URL
  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      formatDoc('insertImage', url);
    }
  };
  
  return (
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="bg-white border-b p-2 flex flex-wrap gap-1 items-center">
        {/* Text formatting */}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => formatDoc('bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => formatDoc('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => formatDoc('underline')}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Headings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Type className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => formatDoc('formatBlock', 'h1')}>
              <Heading1 className="h-4 w-4 mr-2" />
              <span>Heading 1</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatDoc('formatBlock', 'h2')}>
              <Heading2 className="h-4 w-4 mr-2" />
              <span>Heading 2</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatDoc('formatBlock', 'h3')}>
              <Heading3 className="h-4 w-4 mr-2" />
              <span>Heading 3</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatDoc('formatBlock', 'p')}>
              <span className="w-4 h-4 mr-2 inline-block text-center">P</span>
              <span>Paragraph</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Alignment */}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => formatDoc('justifyLeft')}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => formatDoc('justifyCenter')}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => formatDoc('justifyRight')}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Lists */}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => formatDoc('insertUnorderedList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => formatDoc('insertOrderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Link */}
        <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              title="Insert Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="link-text">Text (optional)</Label>
                <Input
                  id="link-text"
                  placeholder="Link text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
              </div>
              <Button onClick={insertLink}>Insert Link</Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Image */}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={insertImage}
          title="Insert Image"
        >
          <Image className="h-4 w-4" />
        </Button>

        {/* Code Block */}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => formatDoc('formatBlock', 'pre')}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => formatDoc('undo')}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => formatDoc('redo')}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor content */}
      <div
        ref={editorRef}
        className="p-4 outline-none min-h-[200px]"
        contentEditable
        onInput={handleInput}
        onFocus={initEditor}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{ minHeight }}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
