import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { mockProfessorOpportunities } from "@/lib/mock-data";
import {
  ArrowLeft,
  MessageCircle,
  User,
  Calendar,
  CheckCircle,
} from "lucide-react";

export default function ProjectPage() {
  const project = mockProfessorOpportunities.find((opp) => opp.id === "po1");

  if (!project) {
    notFound();
  }

  const { professor } = project;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 text-sm text-[#002A5C] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Discover
            </Link>
            <h1 className="mt-3 text-2xl font-bold text-[#002A5C]">
              {project.projectTitle}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {professor.name} — {professor.department}
            </p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Button
              className="bg-[#002A5C] text-white"
            >
              <Link href="/messages" className="flex items-center">
                <MessageCircle className="mr-2 h-4 w-4" />
                I'm Interested
              </Link>
            </Button>
            <Button variant="outline" className="text-sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              Add to Saved
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-gray-200 bg-white">
              {project.image && (
                <div className="relative h-48 overflow-hidden rounded-t-xl">
                  <img
                    src={project.image}
                    alt={project.projectTitle}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h2 className="mt-4 text-lg font-semibold text-[#002A5C]">
                  About this project
                </h2>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                  {project.description}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {project.eligibility && (
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        <User className="h-4 w-4" /> Eligibility
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{project.eligibility}</p>
                    </div>
                  )}

                  {project.deadline && (
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        <Calendar className="h-4 w-4" /> Deadline
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{project.deadline}</p>
                    </div>
                  )}

                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                      <CheckCircle className="h-4 w-4" /> Requirements
                    </div>
                    <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                      {project.requirements.map((req) => (
                        <li key={req}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border border-gray-200 bg-white p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-[#002A5C] flex items-center justify-center text-white text-sm font-semibold">
                  {professor.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#002A5C]">
                    {professor.name}
                  </h3>
                  <p className="text-xs text-gray-500">{professor.department}</p>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-700">
                <p className="font-semibold">About the professor</p>
                <p className="mt-2 leading-relaxed">
                  {professor.bio}
                </p>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-semibold">Email:</span> {project.contact}
                </div>
                <div>
                  <span className="font-semibold">Interests:</span> {professor.interests.join(", ")}
                </div>
              </div>
            </Card>

            <Card className="border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-[#002A5C]">
                How to reach out
              </h3>
              <p className="mt-2 text-sm text-gray-700">
                Click “I’m Interested” to send a message to the professor.
                You can also email them directly using the address below.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Button className="bg-[#002A5C] text-white">
                  <Link href="/messages" className="flex items-center">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message Professor
                  </Link>
                </Button>
                <div className="text-xs text-gray-500">
                  Email: <span className="font-medium">{project.contact}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
