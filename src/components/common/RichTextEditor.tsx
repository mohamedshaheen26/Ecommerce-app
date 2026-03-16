import {
  BtnBold,
  BtnBulletList,
  BtnItalic,
  BtnNumberedList,
  Editor,
  EditorProvider,
  Toolbar,
} from "react-simple-wysiwyg";

interface RichTextEditorProps {
  id: string;
  name: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (name: string, value: string) => void;
}

export default function RichTextEditor({
  id,
  name,
  value,
  placeholder,
  required = false,
  onChange,
}: RichTextEditorProps) {
  const handleEditorChange = (e: { target: { value: string } }) => {
    const nextValue = e.target.value || "";
    onChange(name, nextValue);
  };

  return (
    <div className='w-full'>
      <EditorProvider>
        <Editor
          id={id}
          value={value || ""}
          onChange={handleEditorChange}
          placeholder={placeholder}
          containerProps={{
            className:
              "!border-[var(--border-color)] !rounded-lg !bg-[var(--bg-primary)] text-[var(--text-secondary)]",
          }}
        >
          <Toolbar
            style={{
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-secondary)",
            }}
          >
            <BtnBold color="var(--text-secondary)" />
            <BtnItalic color="var(--text-secondary)" />
            <BtnBulletList color="var(--text-secondary)" />
            <BtnNumberedList color="var(--text-secondary)" />
          </Toolbar>
        </Editor>
      </EditorProvider>

      {required && !value?.trim() && (
        <input
          tabIndex={-1}
          autoComplete='off'
          value=''
          onChange={() => undefined}
          required
          className='absolute opacity-0 pointer-events-none h-0 w-0'
        />
      )}
    </div>
  );
}
