<template>
  <div class="max-w-4xl mx-auto px-4 pt-2 pb-2 sm:py-4">
    <ul class="space-y-0.5 list-disc text-gray-800 dark:text-gray-200 pl-5">
      <li
        v-for="item in notes"
        :key="item.id"
        class="py-0.5 leading-snug break-words outline-item-li"
        :style="{ marginLeft: `${item.indent * 1.5}rem` }"
      >
        <span
          class="inline"
          v-html="renderFormattedContent(item.body)"
        />
        <div v-if="item.image" class="mt-1 w-full">
          <div
            v-if="item.image.startsWith('NOT_FOUND:')"
            class="bg-black text-yellow-400 font-mono text-base font-semibold w-[300px] h-[200px] flex flex-col items-center justify-center text-center rounded p-4 shadow-md my-2"
          >
            no image "{{ item.image.replace('NOT_FOUND:', '') }}" found
          </div>
          <img
            v-else
            :src="`/images/outline/${item.image}`"
            :alt="item.image"
            class="max-w-full h-auto rounded shadow-sm my-1 block"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import notesData from '~~/data-parsed/dijon.json'

interface OutlineItem {
  id: string
  body: string
  indent: number
  image?: string
}

const notes: OutlineItem[] = notesData

useHead({
  title: 'Notes - Dijon 26',
  meta: [
    { name: 'description', content: 'Notes et outline de préparation pour Dijon' }
  ]
})

// Function to escape HTML special characters to prevent XSS
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Clean URL hostname (e.g. https://www.openrunner.com/route-details/23448723 -> openrunner.com)
const simplifyUrl = (rawUrl: string): string => {
  try {
    const urlObj = new URL(rawUrl)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return rawUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || rawUrl
  }
}

// Generate link HTML with icon and simplified URL text
const createFormattedLinkHtml = (url: string, linkText?: string): string => {
  const isYoutube = url.toLowerCase().includes('youtube.com') || url.toLowerCase().includes('youtu.be')
  
  let displayText = ''
  if (isYoutube) {
    displayText = (linkText && linkText.trim()) ? escapeHtml(linkText.trim()) : 'youtube.com'
  } else {
    displayText = escapeHtml(simplifyUrl(url))
  }

  // 18x12px matches the height of lowercase letters (x-height)
  const youtubeIcon = `<svg class="inline-block w-[18px] h-[12px] mr-1 text-red-600 fill-none stroke-current align-middle flex-shrink-0" viewBox="1.5 4.5 21 15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 2px;"><rect width="20" height="14" x="2" y="5" rx="4" fill="currentColor" stroke="none"/><polygon points="10 9 15 12 10 15 10 9" fill="white" stroke="none"/></svg>`
  
  const externalLinkIcon = `<svg class="inline-block w-3.5 h-3.5 mr-1 text-indigo-500 stroke-current fill-none align-middle flex-shrink-0" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`

  const icon = isYoutube ? youtubeIcon : externalLinkIcon

  return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline text-indigo-600 dark:text-indigo-400 no-underline hover:underline hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors">${icon}<span>${displayText}</span></a>`
}

// Render markdown & emoticons
const renderFormattedContent = (text: string): string => {
  if (!text) return ''

  let html = escapeHtml(text)

  // Emoticons: :thinking: -> WhatsApp style thinking face emoji
  const whatsappThinkingEmoji = `<span class="inline font-emoji text-lg align-middle" title=":thinking:">🤔</span>`
  html = html.replace(/:thinking:/g, whatsappThinkingEmoji)

  // 1. Markdown links: [title](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, title, url) => createFormattedLinkHtml(url, title)
  )

  // 2. Bare URLs (http:// or https://) - matching only URLs not already in HTML attributes
  html = html.replace(
    /(^|[\s(])(https?:\/\/[^\s<)]+)/g,
    (_match, prefix, url) => `${prefix}${createFormattedLinkHtml(url)}`
  )

  // Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')

  // Italic: *text*
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>')

  // Pronunciation: [text] at end of line (subdued gray-yellow color, font-mono / courier)
  html = html.replace(
    /\s*\[([^\]]+)\]\s*$/,
    ' <span class="font-mono text-sm text-[#b8a862] dark:text-[#d3c578] font-normal font-courier">[$1]</span>'
  )

  return html
}
</script>

<style scoped>
/* Font stack prioritizing WhatsApp / Apple emoji rendering */
.font-emoji {
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif;
}

.font-courier {
  font-family: "Courier New", Courier, monospace;
}

.outline-item-li {
  display: list-item;
}

.outline-item-li::marker {
  font-size: 0.8em;
  vertical-align: 0.1em;
}
</style>
