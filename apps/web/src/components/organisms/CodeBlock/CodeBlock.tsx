type CodeBlockProps = {
  code: string
  label?: string
}

export function CodeBlock({ code, label = 'Código:' }: CodeBlockProps) {
  return (
    <section className="flex w-full flex-col gap-2">
      <h2 className="text-lg font-semibold text-muted">{label}</h2>
      <pre className="w-full overflow-auto rounded-lg bg-surface p-4 text-sm leading-relaxed text-input shadow-lg">
        <code className="font-mono whitespace-pre">{code}</code>
      </pre>
    </section>
  )
}
