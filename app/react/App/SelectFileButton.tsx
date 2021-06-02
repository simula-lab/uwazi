import React, { RefObject } from 'react';

export type SelectFileButtonProps = {
  onFileImported: (file: File) => any;
  children: any;
};

export function SelectFileButton({ onFileImported, children }: SelectFileButtonProps) {
  const fileInputRef: RefObject<HTMLInputElement> = React.createRef();

  const show = () => {
    if (fileInputRef.current !== null) {
      fileInputRef.current.click();
    }
  };

  const select = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    if (file) {
      onFileImported(file);
    }
  };

  return (
    <div onClick={show} style={{ display: 'inline' }}>
      {children}
      <input
        ref={fileInputRef}
        type="file"
        accept="text/csv"
        style={{ display: 'none' }}
        onChange={select}
      />
    </div>
  );
}
