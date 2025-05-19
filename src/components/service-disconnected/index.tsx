"use client"

import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "/@/components/ui/button"

interface ServiceDisconnectedProps {
  serviceName: string
  children: React.ReactNode
  onConnection: () => Promise<void>
}

export function ServiceDisconnected({
  serviceName = "Service",
  onConnection,
  children,
}: ServiceDisconnectedProps) {
  return (
    <div className="flex justify-center items-center">
      <div className="relative flex flex-col">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h4 className="font-medium text-red-400">Connection Required</h4>
            </div>
            <p className="text-zinc-300">
              {children}
            </p>
          </div>
          <div className="space-y-3">
            <h5 className="font-medium text-white">What you're missing:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {["Data synchronization", "Namespace Navigation", "Data Manipulation", "MongoDB Operations"].map(
                (feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-zinc-300">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center border border-zinc-800">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ),
              )}
            </div>
          </div>
          <Button className="rounded-2xl bg-white cursor-pointer" onClick={onConnection}>
            Connect {serviceName}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
