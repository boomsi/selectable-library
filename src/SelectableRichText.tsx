import React from 'react';
import { Platform, Text, View } from 'react-native';
import type { HostInstance } from 'react-native';
import TextAncestor from 'react-native/Libraries/Text/TextAncestor';
import FabricSelectableRichText, {
  Commands as SelectableRichTextCommands,
} from './NativeSelectableRichTextNativeComponent';
import type {
  SelectableRichTextLongPressEvent,
  SelectableRichTextMenuActionEvent,
  SelectableRichTextMenuItem,
  SelectableRichTextProps,
  SelectableRichTextRef,
  SelectableRichTextSelectionMode,
} from './types';

// SelectableRichText 原生命令名称，和 Fabric native commands 保持一致。
const SELECTABLE_RICH_TEXT_COMMANDS = {
  selectRange: 'selectRange',
  clearSelection: 'clearSelection',
  copyRange: 'copyRange',
} as const;

type NativeSelectableRichTextInstance = HostInstance;

// iOS 和 Android 都使用同名原生 SelectableRichText，其他平台保留 RN Text fallback。
const NativeSelectableRichText =
  Platform.OS === 'ios' || Platform.OS === 'android'
    ? (FabricSelectableRichText as React.ComponentType<
        SelectableRichTextProps & { ref?: React.Ref<NativeSelectableRichTextInstance> }
      >)
    : null;

// 检查 SelectableRichText 子树里是否包含 RN View，避免 View 作为 NSTextAttachment 被整体选中。
function containsUnsupportedViewChild(children: React.ReactNode): boolean {
  let hasUnsupportedView = false;

  React.Children.forEach(children, (child) => {
    // 已经找到 View 时跳过后续检查，避免重复遍历。
    if (hasUnsupportedView) {
      return;
    }

    // 空节点和布尔节点不会渲染成文本内容，不需要继续检查。
    if (child == null || typeof child === 'boolean') {
      return;
    }

    // 字符串和数字会进入文本存储，是 SelectableRichText 支持的内容。
    if (typeof child === 'string' || typeof child === 'number') {
      return;
    }

    // 非 React element 节点无法识别为 RN View，直接跳过。
    if (!React.isValidElement<{ children?: React.ReactNode }>(child)) {
      return;
    }

    // RN View 会被 RN Text 系统转换成 attachment，因此禁止放入 SelectableRichText。
    if (child.type === View) {
      hasUnsupportedView = true;
      return;
    }

    // 继续检查 Text、Fragment 或自定义元素传入的 children，避免深层 View 绕过限制。
    if (
      child.props.children != null &&
      containsUnsupportedViewChild(child.props.children)
    ) {
      hasUnsupportedView = true;
    }
  });

  return hasUnsupportedView;
}

// dispatchSelectableRichTextCommand 统一检查 Fabric HostComponent ref 后再执行命令。
function dispatchSelectableRichTextCommand(
  nativeRef: React.RefObject<NativeSelectableRichTextInstance | null>,
  dispatchCommand: (nativeView: NativeSelectableRichTextInstance) => void
) {
  const nativeView = nativeRef.current;

  // nativeView 为空时说明原生视图尚未挂载，不能发送 Fabric command。
  if (nativeView == null) {
    return;
  }

  dispatchCommand(nativeView);
}

const SelectableRichText = React.forwardRef<
  SelectableRichTextRef,
  SelectableRichTextProps
>(
  (
    {
      selectable = true,
      style,
      children,
      menuItems,
      showSystemMenuItems = true,
      clearSelectionOnMenuAction = false,
      selectionMode = 'default',
      onMenuAction,
      onTextLongPress,
    },
    ref
  ): React.JSX.Element => {
    // 原生命令通过 Fabric HostComponent ref 定位目标原生视图。
    const nativeRef = React.useRef<NativeSelectableRichTextInstance | null>(null);

    // 暴露给 RN 菜单调用的原生选区命令。
    React.useImperativeHandle(
      ref,
      () => ({
        selectRange: (start: number, end: number) => {
          dispatchSelectableRichTextCommand(nativeRef, (nativeView) => {
            SelectableRichTextCommands[SELECTABLE_RICH_TEXT_COMMANDS.selectRange](
              nativeView,
              start,
              end
            );
          });
        },
        clearSelection: () => {
          dispatchSelectableRichTextCommand(nativeRef, (nativeView) => {
            SelectableRichTextCommands[SELECTABLE_RICH_TEXT_COMMANDS.clearSelection](
              nativeView
            );
          });
        },
        copyRange: (start: number, end: number) => {
          dispatchSelectableRichTextCommand(nativeRef, (nativeView) => {
            SelectableRichTextCommands[SELECTABLE_RICH_TEXT_COMMANDS.copyRange](
              nativeView,
              start,
              end
            );
          });
        },
      }),
      []
    );

    // SelectableRichText 只允许文本子树，避免 View 进入原生层后变成不可拆分附件。
    if (containsUnsupportedViewChild(children)) {
      throw new Error(
        'SelectableRichText does not support View children. Use nested Text, or render View outside SelectableRichText.'
      );
    }

    // 未注册原生 SelectableRichText 的平台使用 RN Text 自带 selectable 能力。
    if (!NativeSelectableRichText) {
      return (
        <Text selectable={selectable} style={style}>
          {children}
        </Text>
      );
    }

    // 必须提供 TextAncestor context，使子 <Text> 按 RN 文本子树合并到同一个原生文本块。
    return (
      <NativeSelectableRichText
        ref={nativeRef}
        selectable={selectable}
        style={style}
        menuItems={menuItems}
        showSystemMenuItems={showSystemMenuItems}
        clearSelectionOnMenuAction={clearSelectionOnMenuAction}
        selectionMode={selectionMode}
        onMenuAction={onMenuAction}
        onTextLongPress={onTextLongPress}
      >
        <TextAncestor.Provider value={true}>{children}</TextAncestor.Provider>
      </NativeSelectableRichText>
    );
  }
);

export default SelectableRichText;
export type {
  SelectableRichTextLongPressEvent,
  SelectableRichTextMenuActionEvent,
  SelectableRichTextMenuItem,
  SelectableRichTextRef,
  SelectableRichTextSelectionMode,
};
