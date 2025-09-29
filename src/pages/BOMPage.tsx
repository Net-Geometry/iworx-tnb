import { FileSpreadsheet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BOMList } from "@/components/bom/BOMList";
import { BOMTemplates } from "@/components/bom/BOMTemplates";

const BOMPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
          <FileSpreadsheet className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bill of Materials</h1>
          <p className="text-muted-foreground">Manage component lists and assembly structures</p>
        </div>
      </div>

      <Tabs defaultValue="boms" className="w-full">
        <TabsList>
          <TabsTrigger value="boms">All BOMs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="boms" className="mt-6">
          <BOMList />
        </TabsContent>
        
        <TabsContent value="templates" className="mt-6">
          <BOMTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BOMPage;