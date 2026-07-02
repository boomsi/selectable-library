import type React from 'react';
import {
  codegenNativeCommands,
  codegenNativeComponent,
  type HostComponent,
  type ViewProps,
} from 'react-native';
import type {
  DirectEventHandler,
  Double,
  Int32,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

interface NativeSelectableRichTextMenuItem {
  id: string;
  title: string;
}

interface NativeSelectableRichTextMenuActionEvent {
  id: string;
  title: string;
  selectedText: string;
  selectionStart: Int32;
  selectionEnd: Int32;
}

interface NativeSelectableRichTextLongPressEvent {
  paragraphText: string;
  selectionStart: Int32;
  selectionEnd: Int32;
  // 坐标字段在 Codegen 中必须用 Double，原始 number 会被 codegen 拒绝。
  locationX: Double;
  locationY: Double;
  pageX: Double;
  pageY: Double;
}

export interface NativeSelectableRichTextProps extends ViewProps {
  selectable?: WithDefault<boolean, true>;
  menuItems?: ReadonlyArray<NativeSelectableRichTextMenuItem>;
  showSystemMenuItems?: WithDefault<boolean, true>;
  clearSelectionOnMenuAction?: WithDefault<boolean, false>;
  selectionMode?: WithDefault<'default' | 'menuThenParagraph', 'default'>;
  onMenuAction?: DirectEventHandler<NativeSelectableRichTextMenuActionEvent>;
  onTextLongPress?: DirectEventHandler<NativeSelectableRichTextLongPressEvent>;
}

export type NativeSelectableRichTextComponentType =
  HostComponent<NativeSelectableRichTextProps>;

interface NativeSelectableRichTextCommands {
  // selectRange 让原生文本组件选中指定的 UTF-16 字符范围。
  // Codegen 要求 commands 第一参数必须是 React.ElementRef<HostComponent<...>>。
  selectRange: (
    viewRef: React.ElementRef<NativeSelectableRichTextComponentType>,
    start: Int32,
    end: Int32
  ) => void;

  // clearSelection 清理当前原生文本选区并关闭选区交互状态。
  clearSelection: (
    viewRef: React.ElementRef<NativeSelectableRichTextComponentType>
  ) => void;

  // copyRange 复制指定 UTF-16 字符范围到系统剪贴板。
  copyRange: (
    viewRef: React.ElementRef<NativeSelectableRichTextComponentType>,
    start: Int32,
    end: Int32
  ) => void;
}

// Commands 是 JS ref API 到 Fabric native commands 的唯一派发入口。
export const Commands: NativeSelectableRichTextCommands =
  codegenNativeCommands<NativeSelectableRichTextCommands>({
    supportedCommands: ['selectRange', 'clearSelection', 'copyRange'],
  });

// NativeSelectableRichText 是 Fabric HostComponent 名称，必须和原生 ComponentDescriptor 名称一致。
// 注意：RN 0.85 在 componentNameByReactViewName 中把 "SelectableText" 硬编码转成 "SelectableParagraph"
// 并已被 RN 自身 SelectableParagraph 预留，因此本库使用 "SelectableRichText" 避开名字冲突。
export default codegenNativeComponent<NativeSelectableRichTextProps>(
  'SelectableRichText',
  {
    // interfaceOnly 避免 Codegen 生成普通 View ShadowNode，原生侧使用手写 Paragraph ShadowNode。
    interfaceOnly: true,
  }
);
