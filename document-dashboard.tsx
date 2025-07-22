"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { Search, Plus, FileText, Eye, Download, ArrowLeft } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function DocumentDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("sop")
  const [sopModalOpen, setSopModalOpen] = useState(false)
  const [dslModalOpen, setDslModalOpen] = useState(false)
  const [sopDocuments, setSopDocuments] = useState([])
  const [dslDocuments, setDslDocuments] = useState([])
  const [sopChartData, setSopChartData] = useState([])
  const [dslChartData, setDslChartData] = useState([])

  // Detail view state
  const [isDetailView, setIsDetailView] = useState(false)
  const [detailType, setDetailType] = useState("")
  const [detailDocument, setDetailDocument] = useState(null)

  // SOP form state
  const [sopName, setSopName] = useState("")
  const [sopDate, setSopDate] = useState(new Date())
  const [sopUnit, setSopUnit] = useState("")
  const [sopNumber, setSopNumber] = useState("")
  const [sopFile, setSopFile] = useState(null)
  const [baseFile, setBaseFile] = useState(null)

  // DSL form state
  const [dslLegalBasis, setDslLegalBasis] = useState("")
  const [dslRequirements, setDslRequirements] = useState("")
  const [dslProcedure, setDslProcedure] = useState("")
  const [dslDuration, setDslDuration] = useState("")
  const [dslCost, setDslCost] = useState("")
  const [dslServiceProduct, setDslServiceProduct] = useState("")
  const [dslExecutors, setDslExecutors] = useState("")
  const [dslFile, setDslFile] = useState(null)
  const [baseFileStl, setBaseFileStl] = useState(null)

  // Add a new state for the progress bar
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Add new state variables for the DSL form
  const [dslServiceName, setDslServiceName] = useState("")
  const [dslUnit, setDslUnit] = useState("")

  const API_URL =
    "https://script.google.com/macros/s/AKfycbxtiFSoJymPF5UZJ_Z6XjmQyqpKmduvE7lpRaurPM54XZ2lSPsusGZoXlrSDAb9G73d/exec" // Ganti dengan URL API Google Apps Script

  const API_STL = "https://script.google.com/macros/s/AKfycbzA2qBSNL2aJAbY7pktt2iM16cCJ_aCunJzlNHnyk8t1I5KQNBCkDJNUoF3VYzLDh_e/exec"

  // Fetch data on component mount
  useEffect(() => {
    fetchDocuments()
  }, [])

  // Function to fetch documents from the API
  const fetchDocuments = async () => {
    setIsLoading(true)
    try {
      // In a real application, you would fetch from your Google Apps Script API
      const response = await fetch(API_URL)
      const dataSop = await response.json()
      setSopDocuments(dataSop.data)

      const responseStl = await fetch(API_STL)
      const dataStl = await responseStl.json()
      setDslDocuments(dataStl.data)

      // Calculate chart data
      const uploadedSop = dataSop.data.length
      const uploadedDsl = dataStl.data.length

      setSopChartData([
        { name: "Terupload", value: uploadedSop, color: "hsl(var(--primary))" },
        { name: "Belum Upload", value: 47 - uploadedSop, color: "hsl(var(--muted))" },
      ])

      setDslChartData([
        { name: "Terupload", value: uploadedDsl, color: "hsl(var(--primary))" },
        { name: "Belum Upload", value: 47 - uploadedDsl, color: "hsl(var(--muted))" },
      ])
    } catch (error) {
      console.error("Error fetching documents:", error)
      toast({
        title: "Error",
        description: "Failed to fetch documents. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to handle SOP document upload
  // Update the handleSopUpload function to show progress and refresh data
  const handleSopUpload = async () => {
    if (!sopName || !sopDate || !sopUnit || !sopNumber || !sopFile) {
      toast({
        title: "Validation Error",
        description: "Seluruh Field Harus Terisi",
        variant: "destructive",
      })
      return
    }

    // Close modal immediately
    setSopModalOpen(false)

    // Start upload progress
    setIsUploading(true)
    setUploadProgress(10)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: sopName,
          date: sopDate.toISOString(),
          unit: sopUnit,
          number: sopNumber,
          fileBase64: baseFile,
          fileName: sopFile.name,
        }),
        mode: "no-cors",
      })

      // Clear interval and set to 100%
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Reset form
      setSopName("")
      setSopDate(new Date())
      setSopUnit("")
      setSopNumber("")
      setSopFile(null)
      setBaseFile(null)

      // Refresh data
      await fetchDocuments()

      toast({
        title: "Success",
        description: "SOP document uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading SOP document:", error)
      toast({
        title: "Error",
        description: "Failed to upload SOP document. Please try again.",
        variant: "destructive",
      })
    } finally {
      // Hide progress bar after a short delay
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 1000)
    }
  }

  // Function to handle DSL document upload
  // Update the handleDslUpload function to show progress and refresh data
  const handleDslUpload = async () => {
    if (
      !dslLegalBasis ||
      !dslRequirements ||
      !dslProcedure ||
      !dslDuration ||
      !dslCost ||
      !dslServiceProduct ||
      !dslExecutors ||
      !dslServiceName ||
      !dslUnit ||
      !dslFile
    ) {
      toast({
        title: "Validation Error",
        description: "Seluruh Field Harus Terisi",
        variant: "destructive",
      })
      return
    }

    // Close modal immediately
    setDslModalOpen(false)

    // Start upload progress
    setIsUploading(true)
    setUploadProgress(10)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      const response = await fetch(API_STL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama_layanan: dslServiceName,
          syarat: dslRequirements,
          dasar: dslLegalBasis,
          produk: dslServiceProduct,
          jangka_waktu: dslDuration,
          satker: dslUnit,
          prosedur: dslProcedure,
          biaya: dslCost,
          jml_pelaksana: dslExecutors,
          fileBase64: baseFileStl,
          fileName: dslFile.name,
        }),
        mode: "no-cors",
      })

      // Clear interval and set to 100%
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Refresh data
      await fetchDocuments()

      // Reset form
      setDslLegalBasis("")
      setDslRequirements("")
      setDslProcedure("")
      setDslDuration("")
      setDslCost("")
      setDslServiceProduct("")
      setDslExecutors("")
      setDslServiceName("")
      setDslUnit("")
      setDslFile(null)

      toast({
        title: "Success",
        description: "DSL document uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading DSL document:", error)
      toast({
        title: "Error",
        description: "Failed to upload DSL document. Please try again.",
        variant: "destructive",
      })
    } finally {
      // Hide progress bar after a short delay
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 1000)
    }
  }

  // Function to handle file selection
  const handleFileChange = (e, setFile) => {
    if (e.target.files && e.target.files[0]) {
      // setFile(e.target.files[0])
      const file = e.target.files[0]

      if (file && file.type === "application/pdf" && file.size <= 5 * 1024 * 1024) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          const base64String = reader.result.split(",")[1] // Hapus metadata Base64
          setSopFile(file)
          setBaseFile(base64String)
        }
      } else {
        alert("File harus PDF dan maksimal 5MB!")
      }
    }
  }

  const handleFileChangeStl = (e, setFile) => {
    if (e.target.files && e.target.files[0]) {
      // setFile(e.target.files[0])
      const file = e.target.files[0]

      if (file && file.type === "application/pdf" && file.size <= 5 * 1024 * 1024) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          const base64String = reader.result.split(",")[1] // Hapus metadata Base64
          setDslFile(file)
          setBaseFileStl(base64String)
        }
      } else {
        alert("File harus PDF dan maksimal 5MB!")
      }
    }
  }

  // Function to handle document details view
  const handleViewDetails = (id, type) => {
    let document

    if (type === "sop") {
      document = sopDocuments.find((doc) => doc.id === id)
    } else {
      document = dslDocuments.find((doc) => doc.id === id)
    }

    if (document) {
      setDetailDocument(document)
      setDetailType(type)
      setIsDetailView(true)
    } else {
      toast({
        title: "Error",
        description: "Document not found",
        variant: "destructive",
      })
    }
  }

  // Function to handle download
  const handleDownload = (fileUrl) => {
    // In a real application, you would trigger the download here
    window.open(fileUrl, "_blank")

    toast({
      title: "Download Started",
      description: "Your document is being downloaded",
    })
  }

  // Filter documents based on search query
  const filteredSopDocuments = sopDocuments.filter((doc) =>
    doc.nama_sop.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const filteredDslDocuments = dslDocuments.filter(
    (doc) =>
      doc.dasar_hukum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.produk_layanan.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Custom legend renderer for donut charts
  const renderCustomLegend = (props) => {
    const { payload } = props
    return (
      <div className="flex flex-col gap-2 text-sm">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  // Render detail view
  if (isDetailView && detailDocument) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Button variant="ghost" onClick={() => setIsDetailView(false)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Dashboard
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{detailType === "sop" ? "Detail SOP" : "Detail Dokumen Standar Layanan"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {detailType === "sop" ? (
                <>
                  <div>
                    <strong>Nama SOP:</strong> {detailDocument.nama_sop}
                  </div>
                  <div>
                    <strong>Tanggal SOP:</strong> {detailDocument.tanggal_sop}
                  </div>
                  <div>
                    <strong>Satuan Kerja:</strong> {detailDocument.satuan_kerja}
                  </div>
                  <div>
                    <strong>No SOP:</strong> {detailDocument.nomor_sop}
                  </div>
                  <div>
                    <strong>Tanggal Upload:</strong> {detailDocument.tanggal_upload}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <strong>Nama Layanan:</strong>
                  </div>
                  <div>
                  {detailDocument.nama_stl || "-"}
                  </div>
                  <div>
                    <strong>Dasar Hukum:</strong>
                  </div>
                  <div>
                    {detailDocument.dasar_hukum}
                  </div>
                  <div>
                    <strong>Satuan Kerja:</strong>
                  </div>
                  <div>
                    {detailDocument.satuan_kerja || "-"}
                  </div>
                  <div>
                    <strong>Persyaratan:</strong>
                  </div>
                  <div>
                    {detailDocument.persyaratan}
                  </div>
                  <div>
                    <strong>Sistem Mekanisme Prosedur:</strong>
                  </div>
                  <div>
                    {detailDocument.prosedur}
                  </div>
                  <div>
                    <strong>Jangka Waktu:</strong>
                  </div>
                  <div>
                    {detailDocument.jangka_waktu}
                  </div>
                  <div>
                    <strong>Biaya/Tarif:</strong>
                  </div>
                  <div>
                    {detailDocument.biaya}
                  </div>
                  <div>
                    <strong>Produk Layanan:</strong>
                  </div>
                  <div>
                    {detailDocument.produk_layanan}
                  </div>
                  <div>
                    <strong>Jumlah Pelaksana:</strong>
                  </div>
                  <div>
                    {detailDocument.jml_pelaksana}
                  </div>
                  <div>
                    <strong>Sarana dan Prasarana:</strong>
                  </div>
                  <div>
                    {detailDocument.sarana}
                  </div>
                  <div>
                    <strong>Kompetensi Pelaksana:</strong>
                  </div>
                  <div>
                    {detailDocument.kompetensi}
                  </div>
                  <div>
                    <strong>Pengawasan Internal:</strong>
                  </div>
                  <div>
                    {detailDocument.pengawasan}
                  </div>
                  <div>
                    <strong>Penanganan Aduan:</strong>
                  </div>
                  <div>
                    {detailDocument.pengaduan}
                  </div>
                  <div>
                    <strong>Jaminan Pelayanan:</strong>
                  </div>
                  <div>
                    {detailDocument.jaminan}
                  </div>
                  <div>
                    <strong>Jaminan Keamanan:</strong>
                  </div>
                  <div>
                    {detailDocument.keamanan}
                  </div>
                  <div>
                    <strong>Evaluasi Kinerja Pelaksana:</strong>
                  </div>
                  <div>
                    {detailDocument.evaluasi}
                  </div>
                  <div>
                    <strong>Tanggal Upload:</strong>
                  </div>
                  <div>
                    {detailDocument.tanggal_upload}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Button onClick={() => handleDownload(detailDocument.fileuri)}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>

        <Toaster />
      </div>
    )
  }

  // Render main dashboard view
  return (
    <div className="container mx-auto p-4 md:p-6">
      {isUploading && (
        <div className="fixed inset-x-0 top-0 z-50">
          <div className="h-1 bg-gray-200">
            <div
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">Dashboard Monitoring Dokumen</h1>

      {/* Charts Section */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Status Dokumen SOP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sopChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {sopChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend content={renderCustomLegend} layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Status Dokumen Standar Layanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dslChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {dslChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend content={renderCustomLegend} layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table Section */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <CardTitle>Daftar Dokumen</CardTitle>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button className="flex items-center gap-2" onClick={() => setSopModalOpen(true)}>
                <Plus className="h-4 w-4" />
                <span>Tambah SOP</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={() => setDslModalOpen(true)}>
                <Plus className="h-4 w-4" />
                <span>Tambah Dokumen Standar Layanan</span>
              </Button>
              <Button className="flex items-center gap-2">
               <a href="https://drive.google.com/drive/folders/1MUIp-qF1PhUwXjWJnbSUm8-xwoULUWHy?usp=drive_link" target="_blank"><span>Contoh Dokumen</span></a>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sop" className="mt-6" value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <TabsList>
                <TabsTrigger value="sop" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  SOP
                </TabsTrigger>
                <TabsTrigger value="dsl" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Dokumen Standar Layanan
                </TabsTrigger>
              </TabsList>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari dokumen..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <TabsContent value="sop" className="mt-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama SOP</TableHead>
                      <TableHead>Tanggal SOP</TableHead>
                      <TableHead>Satuan Kerja</TableHead>
                      <TableHead>No SOP</TableHead>
                      <TableHead>Tanggal Upload</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredSopDocuments.length > 0 ? (
                      filteredSopDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.nama_sop}</TableCell>
                          <TableCell>{doc.tanggal_sop.split("T")[0]}</TableCell>
                          <TableCell>{doc.satuan_kerja}</TableCell>
                          <TableCell>{doc.nomor_sop}</TableCell>
                          <TableCell>{doc.tanggal_upload.split("T")[0]}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDownload(doc.fileuri)}
                            >
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleViewDetails(doc.id, "sop")}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View Details</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Tidak ada dokumen yang ditemukan.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="dsl" className="mt-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Layanan</TableHead>
                      <TableHead>Dasar Hukum</TableHead>
                      <TableHead>Satuan Kerja</TableHead>
                      <TableHead>Persyaratan</TableHead>
                      <TableHead>Jangka Waktu</TableHead>
                      <TableHead>Biaya/Tarif</TableHead>
                      <TableHead>Produk Layanan</TableHead>
                      <TableHead>Jumlah Pelaksana</TableHead>
                      <TableHead>Tanggal Upload</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="h-24 text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredDslDocuments.length > 0 ? (
                      filteredDslDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.nama_stl}</TableCell>
                          <TableCell className="font-medium">{doc.dasar_hukum}</TableCell>
                          <TableCell>{doc.satuan_kerja}</TableCell>
                          <TableCell>{doc.persyaratan}</TableCell>
                          <TableCell>{doc.jangka_waktu}</TableCell>
                          <TableCell>{doc.biaya}</TableCell>
                          <TableCell>{doc.produk_layanan}</TableCell>
                          <TableCell>{doc.jml_pelaksana}</TableCell>
                          <TableCell>{doc.tanggal_upload.split("T")[0]}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDownload(doc.fileuri)}
                            >
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleViewDetails(doc.id, "dsl")}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View Details</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="h-24 text-center">
                          Tidak ada dokumen yang ditemukan.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* SOP Upload Modal */}
      <Dialog open={sopModalOpen} onOpenChange={setSopModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Dokumen SOP</DialogTitle>
            <DialogDescription>Isi informasi dokumen SOP yang akan diunggah.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sop-name">Nama SOP</Label>
              <Input
                id="sop-name"
                value={sopName}
                onChange={(e) => setSopName(e.target.value)}
                placeholder="Masukkan nama SOP"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sop-date">Tanggal SOP</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${!sopDate && "text-muted-foreground"}`}
                  >
                    {sopDate ? format(sopDate, "PPP") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={sopDate} onSelect={setSopDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sop-unit">Satuan Kerja</Label>
              <Select onValueChange={setSopUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih satuan kerja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sub Bagian Tata Usaha">Sub Bagian Tata Usaha</SelectItem>
                  <SelectItem value="Pendidikan Islam">Pendidikan Islam</SelectItem>
                  <SelectItem value="Bimas Islam">Bimas Islam</SelectItem>
                  <SelectItem value="Bimas Buddha">Bimas Buddha</SelectItem>
                  <SelectItem value="Penyelenggara Haji & Umrah">Penyelenggara Haji & Umrah</SelectItem>
                  <SelectItem value="Penyelenggara Katolik">Penyelenggara Katolik</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sop-number">No SOP</Label>
              <Input
                id="sop-number"
                value={sopNumber}
                onChange={(e) => setSopNumber(e.target.value)}
                placeholder="Masukkan nomor SOP"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sop-file">File SOP (PDF)</Label>
              <Input id="sop-file" type="file" accept=".pdf" onChange={(e) => handleFileChange(e, setSopFile)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSopModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSopUpload}>Unggah</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DSL Upload Modal */}
      <Dialog open={dslModalOpen} onOpenChange={setDslModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Dokumen Standar Layanan</DialogTitle>
            <DialogDescription>Isi informasi dokumen standar layanan yang akan diunggah.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
              <Label htmlFor="dsl-service-name">Nama Layanan</Label>
              <Input
                id="dsl-service-name"
                value={dslServiceName}
                onChange={(e) => setDslServiceName(e.target.value)}
                placeholder="Masukkan nama layanan"
              />
          </div>
          <div className="grid gap-4 py-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="dsl-legal-basis">Dasar Hukum</Label>
              <Textarea
                id="dsl-legal-basis"
                value={dslLegalBasis}
                onChange={(e) => setDslLegalBasis(e.target.value)}
                placeholder="Masukkan dasar hukum"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dsl-unit">Satuan Kerja</Label>
              <Select onValueChange={setDslUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih satuan kerja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sub Bagian Tata Usaha">Sub Bagian Tata Usaha</SelectItem>
                  <SelectItem value="Pendidikan Islam">Pendidikan Islam</SelectItem>
                  <SelectItem value="Bimas Islam">Bimas Islam</SelectItem>
                  <SelectItem value="Bimas Buddha">Bimas Buddha</SelectItem>
                  <SelectItem value="Penyelenggara Haji & Umrah">Penyelenggara Haji & Umrah</SelectItem>
                  <SelectItem value="Penyelenggara Katolik">Penyelenggara Katolik</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dsl-requirements">Persyaratan</Label>
              <Textarea
                id="dsl-requirements"
                value={dslRequirements}
                onChange={(e) => setDslRequirements(e.target.value)}
                placeholder="Masukkan persyaratan"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dsl-procedure">Sistem Mekanisme Prosedur</Label>
              <Textarea
                id="dsl-procedure"
                value={dslProcedure}
                onChange={(e) => setDslProcedure(e.target.value)}
                placeholder="Masukkan sistem mekanisme prosedur"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dsl-duration">Jangka Waktu</Label>
              <Input
                id="dsl-duration"
                value={dslDuration}
                onChange={(e) => setDslDuration(e.target.value)}
                placeholder="Masukkan jangka waktu"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dsl-cost">Biaya/Tarif</Label>
              <Input
                id="dsl-cost"
                value={dslCost}
                onChange={(e) => setDslCost(e.target.value)}
                placeholder="Masukkan biaya/tarif"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dsl-service-product">Produk Layanan</Label>
              <Input
                id="dsl-service-product"
                value={dslServiceProduct}
                onChange={(e) => setDslServiceProduct(e.target.value)}
                placeholder="Masukkan produk layanan"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dsl-executors">Jumlah Pelaksana</Label>
              <Input
                id="dsl-executors"
                type="number"
                value={dslExecutors}
                onChange={(e) => setDslExecutors(e.target.value)}
                placeholder="Masukkan jumlah pelaksana"
              />
            </div>


            <div className="grid gap-2">
              <Label htmlFor="dsl-file">File Dokumen (PDF)</Label>
              <Input id="dsl-file" type="file" accept=".pdf" onChange={(e) => handleFileChangeStl(e, setDslFile)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDslModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleDslUpload}>Unggah</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
