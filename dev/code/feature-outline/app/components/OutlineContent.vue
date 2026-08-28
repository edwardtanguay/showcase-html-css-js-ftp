<template>
  <div v-if="text" class="outline-content space-y-1">
    <template v-for="item in parsedItems" :key="item.id">
      <div v-if="item.isEmpty" class="h-3 select-none" />
      <div
        v-else
        class="outline-item flex items-start group"
        :style="{ paddingLeft: `${item.indent * 1.25}rem` }"
      >
        <span v-if="item.isBullet" class="text-gray-400 dark:text-gray-500 mr-2 select-none font-bold">
          •
        </span>
        <div class="flex-1 min-w-0">
          <span
            class="inline leading-relaxed break-words"
            :class="textClass || 'text-gray-800 dark:text-gray-200'"
            v-html="renderFormattedContent(item.body)"
          />
          <div v-if="item.image" class="mt-2">
            <div
              v-if="item.image.startsWith('NOT_FOUND:')"
              class="bg-black/90 text-amber-300 font-mono text-xs font-semibold px-3 py-2 rounded-lg inline-flex items-center gap-2 border border-amber-500/30"
            >
              <span>Image introuvable : {{ item.image.replace('NOT_FOUND:', '') }}</span>
            </div>
            <img
              v-else
              :src="`/images/outline/${item.image}`"
              :alt="item.image"
              class="max-w-full max-h-64 object-contain rounded-xl shadow-md border border-gray-200 dark:border-gray-700 my-1 block"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  text?: string | null
  availableImages?: string[]
  maxLines?: number
  textClass?: string
}>()

interface ParsedOutlineLine {
  id: string
  body: string
  indent: number
  isBullet: boolean
  isEmpty?: boolean
  image?: string
}

const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const simplifyUrl = (rawUrl: string): string => {
  try {
    const urlObj = new URL(rawUrl)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return rawUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || rawUrl
  }
}

const createFormattedLinkHtml = (url: string, linkText?: string): string => {
  const isYoutube = url.toLowerCase().includes('youtube.com') || url.toLowerCase().includes('youtu.be')
  
  let displayText = ''
  if (isYoutube) {
    displayText = (linkText && linkText.trim()) ? escapeHtml(linkText.trim()) : 'youtube.com'
  } else {
    displayText = escapeHtml(simplifyUrl(url))
  }

  const youtubeIcon = `<svg class="inline-block w-[16px] h-[11px] mr-1 text-red-600 fill-none stroke-current align-middle flex-shrink-0" viewBox="1.5 4.5 21 15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 2px;"><rect width="20" height="14" x="2" y="5" rx="4" fill="currentColor" stroke="none"/><polygon points="10 9 15 12 10 15 10 9" fill="white" stroke="none"/></svg>`
  const externalLinkIcon = `<svg class="inline-block w-3.5 h-3.5 mr-1 text-indigo-500 stroke-current fill-none align-middle flex-shrink-0" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`

  const icon = isYoutube ? youtubeIcon : externalLinkIcon

  return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline text-indigo-600 dark:text-indigo-400 no-underline hover:underline hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors">${icon}<span>${displayText}</span></a>`
}

const renderFormattedContent = (content: string): string => {
  if (!content) return ''

  let html = escapeHtml(content)

  // Emoticons
  html = html.replace(/:thinking:/g, `<span class="inline font-emoji text-lg align-middle" title=":thinking:">🤔</span>`)

  // 1. Markdown links: [title](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, title, url) => createFormattedLinkHtml(url, title)
  )

  // 2. Bare URLs
  html = html.replace(
    /(^|[\s(])(https?:\/\/[^\s<)]+)/g,
    (_match, prefix, url) => `${prefix}${createFormattedLinkHtml(url)}`
  )

  // Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')

  // Italic: *text*
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>')

  // Pronunciation: [text] at end of line
  html = html.replace(
    /\s*\[([^\]]+)\]\s*$/,
    ' <span class="font-mono text-sm text-[#b8a862] dark:text-[#d3c578] font-normal font-courier">[$1]</span>'
  )

  return html
}

const parsedItems = computed<ParsedOutlineLine[]>(() => {
  if (!props.text) return []

  const rawLines = props.text.split('\n')
  const items: ParsedOutlineLine[] = []

  rawLines.forEach((line, idx) => {
    if (!line.trim()) {
      // Préserver la ligne vide comme espacement s'il ne s'agit pas de lignes vides consécutives inutiles
      const prev = items[items.length - 1]
      if (items.length > 0 && prev && !prev.isEmpty) {
        items.push({
          id: `line-empty-${idx}-${Date.now()}`,
          body: '',
          indent: 0,
          isBullet: false,
          isEmpty: true,
        })
      }
      return
    }

    // Calculate indent (tabs or multiples of 2/4 spaces)
    let indent = 0
    while (indent < line.length && line.charAt(indent) === '\t') {
      indent++
    }

    let content = line.substring(indent)
    let isBullet = false

    if (content.startsWith('- ') || content.startsWith('* ')) {
      isBullet = true
      content = content.substring(2)
    } else if (content.startsWith('-') || content.startsWith('*')) {
      isBullet = true
      content = content.substring(1)
    }

    let image: string | undefined = undefined
    const tagMatch = content.match(/##([a-zA-Z0-9_\-]+)\s*$/)
    if (tagMatch) {
      const tag = tagMatch[1]
      content = content.replace(/##[a-zA-Z0-9_\-]+\s*$/, '').trimEnd()

      if (props.availableImages && props.availableImages.length > 0) {
        const found = props.availableImages.find(f => {
          const base = f.substring(0, f.lastIndexOf('.')).toLowerCase()
          return base === tag?.toLowerCase()
        })
        if (found) {
          image = found
        } else {
          image = `NOT_FOUND:${tag}`
        }
      } else {
        // Default fallback match logic
        image = `${tag}.png`
      }
    }

    items.push({
      id: `line-${idx}-${Date.now()}`,
      body: content,
      indent,
      isBullet,
      image,
    })
  })

  // Supprimer toute ligne vide traînante en fin
  while (items.length > 0 && items[items.length - 1]?.isEmpty) {
    items.pop()
  }

  if (props.maxLines && props.maxLines > 0 && items.length > props.maxLines) {
    const truncated = items.slice(0, props.maxLines)
    const lastItem = truncated[truncated.length - 1]
    if (lastItem && !lastItem.body.endsWith('...')) {
      lastItem.body = `${lastItem.body} ...`
    }
    return truncated
  }

  return items
})
</script>

<style scoped>
.font-emoji {
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif;
}
.font-courier {
  font-family: "Courier New", Courier, monospace;
}
</style>
