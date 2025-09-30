import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useSkills } from "@/hooks/useSkills";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const SkillsLibraryPage = () => {
  const { skills, isLoading, createSkill } = useSkills();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    skill_name: "",
    skill_code: "",
    category: "other" as any,
    description: "",
    certification_required: false,
  });

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.skill_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || skill.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSkill.mutateAsync(formData);
    setOpen(false);
    setFormData({
      skill_name: "",
      skill_code: "",
      category: "other",
      description: "",
      certification_required: false,
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      mechanical: "default",
      electrical: "secondary",
      plumbing: "outline",
      hvac: "default",
      instrumentation: "secondary",
      safety: "destructive",
      software: "outline",
      other: "secondary",
    };
    return colors[category] || "secondary";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Skills Library</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skill_name">Skill Name</Label>
                <Input
                  id="skill_name"
                  value={formData.skill_name}
                  onChange={(e) => setFormData({ ...formData, skill_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill_code">Skill Code</Label>
                <Input
                  id="skill_code"
                  value={formData.skill_code}
                  onChange={(e) => setFormData({ ...formData, skill_code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mechanical">Mechanical</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="instrumentation">Instrumentation</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="certification_required"
                  checked={formData.certification_required}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, certification_required: checked as boolean })
                  }
                />
                <Label htmlFor="certification_required">Certification Required</Label>
              </div>
              <Button type="submit" className="w-full">Create Skill</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="mechanical">Mechanical</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
            <SelectItem value="plumbing">Plumbing</SelectItem>
            <SelectItem value="hvac">HVAC</SelectItem>
            <SelectItem value="instrumentation">Instrumentation</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="software">Software</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Skill Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Certification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredSkills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No skills found
                </TableCell>
              </TableRow>
            ) : (
              filteredSkills.map((skill) => (
                <TableRow key={skill.id}>
                  <TableCell className="font-medium">{skill.skill_code}</TableCell>
                  <TableCell>{skill.skill_name}</TableCell>
                  <TableCell>
                    <Badge variant={getCategoryColor(skill.category) as any}>
                      {skill.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">{skill.description || '-'}</TableCell>
                  <TableCell>
                    {skill.certification_required ? (
                      <Badge variant="destructive">Required</Badge>
                    ) : (
                      <Badge variant="outline">Optional</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SkillsLibraryPage;