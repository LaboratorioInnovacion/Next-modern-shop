"use client"
import React from 'react'
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'
import useInvoiceDownload from './useInvoiceDownload'

export default function InvoiceDownloadButton({ orderDetails }) {
  const download = useInvoiceDownload(orderDetails);

  return (
    <Button
      variant="outline"
      className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
      onClick={download}
    >
      <Download className="w-4 h-4 mr-2" />
      Descargar Factura
    </Button>
  )
}
