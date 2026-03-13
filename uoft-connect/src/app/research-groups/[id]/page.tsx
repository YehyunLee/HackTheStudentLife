import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockResearchGroups } from "@/lib/mock-data";
import {
  ArrowLeft,
  MessageCircle,
  ExternalLink,
  Users,
  BookOpen,
  User,
} from "lucide-react";

export function generateStaticParams() {
  return mockResearchGroups.map((group) => ({
    id: group.id,
  }));
}

export default async function ResearchGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = mockResearchGroups.find((group) => group.id === id);

  if (!group) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
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
              {group.name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {group.department} Department
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
            {group.url && (
              <a href={group.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Website
                </Button>
              </a>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            {group.image && (
              <Card className="overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={group.image}
                    alt={group.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#002A5C]">About the Group</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {group.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {group.longDescription || group.description}
                </p>
              </CardContent>
            </Card>

            {/* Research Areas */}
            {group.researchAreas && group.researchAreas.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#002A5C] flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Research Areas
                </h2>
                {group.researchAreas.map((area) => (
                  <Card key={area.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{area.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{area.description}</p>

                      {/* Papers in horizontal scroll */}
                      {area.papers && area.papers.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-[#002A5C] mb-3">Recent Publications</h4>
                          <div className="flex gap-4 overflow-x-auto pb-2">
                            {area.papers.map((paper) => (
                              <Card key={paper.id} className="min-w-[300px] flex-shrink-0">
                                <CardContent className="p-4">
                                  <h5 className="font-medium text-sm mb-2 line-clamp-2">{paper.title}</h5>
                                  <p className="text-xs text-gray-600 mb-1">
                                    {paper.authors.join(", ")}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {paper.journal} ({paper.year})
                                  </p>
                                  {paper.doi && (
                                    <a
                                      href={`https://doi.org/${paper.doi}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                    >
                                      DOI: {paper.doi}
                                    </a>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#002A5C] flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">Email: {group.contact}</p>
                {group.contactPerson && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={group.contactPerson.avatar}
                      alt={group.contactPerson.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-sm">{group.contactPerson.name}</p>
                      <p className="text-xs text-gray-500">{group.contactPerson.role}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Members */}
            {group.members && group.members.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#002A5C] flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Group Members
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {group.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role} • {member.department}</p>
                        </div>
                      </div>
                      <Link href="/messages">
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}