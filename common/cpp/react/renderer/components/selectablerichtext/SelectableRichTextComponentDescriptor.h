#pragma once

#include <react/renderer/components/selectablerichtext/SelectableRichTextShadowNode.h>
#include <react/renderer/components/text/BaseParagraphComponentDescriptor.h>

namespace facebook::react {

/*
 * Descriptor for <SelectableRichText>.
 * It injects TextLayoutManager the same way RN Paragraph does, so text measurement and state stay compatible.
 */
class SelectableRichTextComponentDescriptor final
    : public BaseParagraphComponentDescriptor<SelectableRichTextShadowNode> {
 public:
  using BaseParagraphComponentDescriptor::BaseParagraphComponentDescriptor;
};

} // namespace facebook::react
