"use client"

import { useCallback, useState } from "react"
import { $isRangeSelection, BaseSelection, $getSelection } from "lexical"
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
} from "@lexical/list"
import { $isHeadingNode, $createHeadingNode } from "@lexical/rich-text"
import { $setBlocksType } from "@lexical/selection"
import { $findMatchingParent } from "@lexical/utils"
import { $createParagraphNode } from "lexical"
import {
  ListIcon,
  ListOrderedIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  TypeIcon,
} from "lucide-react"

import { useToolbarContext } from "@/components/editor/context/toolbar-context"
import { useUpdateToolbarHandler } from "@/components/editor/editor-hooks/use-update-toolbar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

const BLOCK_TYPES = [
  { label: "Normal", value: "paragraph", icon: TypeIcon },
  { label: "Heading 1", value: "h1", icon: Heading1Icon },
  { label: "Heading 2", value: "h2", icon: Heading2Icon },
  { label: "Heading 3", value: "h3", icon: Heading3Icon },
]

export function BlockFormatToolbarPlugin() {
  const { activeEditor, blockType, setBlockType } = useToolbarContext()
  const [isListNode, setIsListNode] = useState(false)

  const $updateToolbar = useCallback((selection: BaseSelection) => {
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent()
              return parent !== null && parent.getKey() === "root"
            })

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow()
      }

      const elementKey = element.getKey()
      const elementDOM = activeEditor.getElementByKey(elementKey)

      if (elementDOM !== null) {
        setIsListNode($isListNode(element))
        if ($isListNode(element)) {
          const parentList = $findMatchingParent(element, $isListNode)
          const type = parentList ? parentList.getListType() : element.getListType()
          setBlockType(type)
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType()
          if (type in BLOCK_TYPES) {
            setBlockType(type)
          }
        }
      }
    }
  }, [activeEditor, setBlockType])

  useUpdateToolbarHandler($updateToolbar)

  const formatBulletList = () => {
    if (blockType !== "bullet") {
      activeEditor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    } else {
      activeEditor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    }
  }

  const formatNumberedList = () => {
    if (blockType !== "number") {
      activeEditor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    } else {
      activeEditor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    }
  }

  const currentBlockType = BLOCK_TYPES.find(type => type.value === blockType) || BLOCK_TYPES[0]
  const CurrentIcon = currentBlockType.icon

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <CurrentIcon className="size-4" />
            {currentBlockType.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {BLOCK_TYPES.map(({ label, value, icon: Icon }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => {
                activeEditor.update(() => {
                  const selection = $getSelection()
                  if ($isRangeSelection(selection)) {
                    if (value === "paragraph") {
                      $setBlocksType(selection, () => $createParagraphNode())
                    } else {
                      $setBlocksType(selection, () => $createHeadingNode(value as any))
                    }
                  }
                })
                setBlockType(value)
              }}
            >
              <Icon className="mr-2 size-4" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant={blockType === "bullet" ? "default" : "outline"}
        size="sm"
        onClick={formatBulletList}
        aria-label="Bullet List"
      >
        <ListIcon className="size-4" />
      </Button>

      <Button
        variant={blockType === "number" ? "default" : "outline"}
        size="sm"
        onClick={formatNumberedList}
        aria-label="Numbered List"
      >
        <ListOrderedIcon className="size-4" />
      </Button>
    </div>
  )
}