import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
// import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseProjectQuery } from "@/hooks/use-project";
import { getProjectProgress } from "@/lib";
import { cn } from "@/lib/utils";
import type { Project, Task, TaskStatus } from "@/types";
import { format } from "date-fns";
import { AlertCircle, Calendar, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
const ProjectDetails = () => {}