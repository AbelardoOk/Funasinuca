/*Layout guarda oque é usado nas páginas do site -> Fontes e metadados */
/*POV: Miguel, se estiver lendo isso, você é um tamanduá bandeira*/

// "import type" traz apenas a TIPAGEM do Next.js
// (Metadata = um "molde" que diz quais campos são válidos)
import type { Metadata } from 'next'

import { Inter } from 'next/font/google'
import './globals.css'

// Configura a fonte: qual subset de caracteres usar
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Funasinuca',
  description:
    'Reserve sua mesa de sinuca no Batata+ de forma rápida',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode   // ReactNode = qualquer coisa renderizável no React
}) {
  return (
    // Em TSX, o atributo HTML "class" se escreve "className"
    <html lang="pt-BR">
      {/*
        A tag <body> recebe a classe da fonte (inter.className),
        o que aplica a tipografia em todo o site.
      */}
      <body className={inter.className}>
        {children}   {/* aqui entra o conteúdo de page.tsx */}
      </body>
    </html>
  )
}

