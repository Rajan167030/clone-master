import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, CheckCircle2, Eye, FileText, Image as ImageIcon, Layers, Loader2, MessageSquareText, Mic, Mic2, Pencil, Rocket, ShieldCheck, Star, Target, TrendingUp, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import PitchDeckViewerModal from "@/components/PitchDeckViewerModal";
import StartupProfileModal from "@/components/StartupProfileModal";
import InvestorProfileModal from "@/components/InvestorProfileModal";
import { getAccount } from "@/lib/session";
import {
  DEFAULT_RATING_SCORES,
  RATING_CRITERIA as RATING_CRITERIA_BASE,
  RATING_MAX_TOTAL,
  RATING_SCALE_MAX,
  ratingScoreLabel,
} from "@/lib/rating-criteria";
import {
  type ActivityInvestorProfile,
  type ActivityStartupItem,
  type RatingScores,
  getBangaloreInvestorsApi,
  getBangaloreStartupsApi,
  getPublicCloudinaryUploadSignatureApi,
  submitRoomRatingApi,
  transcribeVoiceNoteApi,
} from "@/lib/api";

const RANK_BADGES = ["🥇 #1 Rank", "🥈 #2 Rank", "🥉 #3 Rank"];

// Chrome/Edge only — Firefox and Safari don't ship the Web Speech API, so live captions are
// a progressive enhancement: the mic still records normally, we just fall back to the existing
// upload-then-transcribe-with-Whisper path when this isn't available.
const getSpeechRecognitionCtor = (): (new () => any) | null =>
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;

const CRITERION_ICON: Record<string, typeof Target> = {
  problemClarity: Target,
  solutionViability: CheckCircle2,
  mvpFit: Layers,
  market: TrendingUp,
  traction: Rocket,
  pitch: Mic2,
  qna: MessageSquareText,
};

const CRITERION_COLOR: Record<string, string> = {
  problemClarity: "#0891b2",
  solutionViability: "#059669",
  mvpFit: "#7c3aed",
  market: "#2563eb",
  traction: "#059669",
  pitch: "#e11d48",
  qna: "#db2777",
};

const RATING_CRITERIA = RATING_CRITERIA_BASE.map((c) => ({
  ...c,
  icon: CRITERION_ICON[c.key],
  color: CRITERION_COLOR[c.key],
}));

const DEFAULT_SCORES: RatingScores = DEFAULT_RATING_SCORES;
const SCORE_VALUES = Array.from({ length: RATING_SCALE_MAX }, (_, i) => i + 1);

// Score-meter color ramps from rose (low) through amber to emerald (high) as the total climbs.
const scoreMeterColor = (percent: number) => {
  if (percent < 40) return "#e11d48";
  if (percent < 70) return "#d97706";
  return "#059669";
};

type Sais26RoomProps = {
  viewerRole: "investor" | "founder" | "admin";
  authToken?: string;
  highlightStartupId?: string;
  founderAccessToken?: string;
};

const Sais26Room = ({ viewerRole, authToken, highlightStartupId, founderAccessToken }: Sais26RoomProps) => {
  const { toast } = useToast();
  const currentAccount = useMemo(() => getAccount(), []);
  const [startups, setStartups] = useState<ActivityStartupItem[]>([]);
  const [investors, setInvestors] = useState<ActivityInvestorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewDeckStartup, setViewDeckStartup] = useState<ActivityStartupItem | null>(null);
  const [profileStartup, setProfileStartup] = useState<ActivityStartupItem | null>(null);
  const [profileInvestor, setProfileInvestor] = useState<ActivityInvestorProfile | null>(null);
  const [ratingTargetStartup, setRatingTargetStartup] = useState<ActivityStartupItem | null>(null);
  const [ratingScores, setRatingScores] = useState<RatingScores>(DEFAULT_SCORES);
  const [ratingComment, setRatingComment] = useState("");
  const [feedbackImageUrl, setFeedbackImageUrl] = useState("");
  const [voiceNoteUrl, setVoiceNoteUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isUpdatingExisting, setIsUpdatingExisting] = useState(false);
  const [hoverPreview, setHoverPreview] = useState<{ key: string; star: number } | null>(null);

  // Live mic recording — the investor speaks, captions appear as they talk (Web Speech API),
  // while the raw audio is captured in parallel and uploaded as the usual voice note on stop.
  const [isRecording, setIsRecording] = useState(false);
  const [liveCaption, setLiveCaption] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const gotLiveTranscriptRef = useRef(false);

  const load = async () => {
    const [freshStartups, freshInvestors] = await Promise.all([
      getBangaloreStartupsApi(),
      getBangaloreInvestorsApi(),
    ]);
    setStartups(
      [...freshStartups].sort((a, b) => b.averageScore - a.averageScore || b.totalRatingsCount - a.totalRatingsCount),
    );
    setInvestors(freshInvestors);
    setIsLoading(false);
  };

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 8000);
    return () => clearInterval(interval);
  }, []);

  const openRatingDialog = (startup: ActivityStartupItem) => {
    const myExisting = currentAccount?.fullName
      ? startup.ratings?.find((r) => r.investorName === currentAccount.fullName)
      : undefined;

    if (myExisting) {
      setRatingScores(myExisting.scores);
      setRatingComment(myExisting.comment || "");
      setFeedbackImageUrl(myExisting.feedbackImageUrl || "");
      setVoiceNoteUrl(myExisting.voiceNoteUrl || "");
      setIsUpdatingExisting(true);
    } else {
      setRatingScores(DEFAULT_SCORES);
      setRatingComment("");
      setFeedbackImageUrl("");
      setVoiceNoteUrl("");
      setIsUpdatingExisting(false);
    }
    setHoverPreview(null);
    setRatingTargetStartup(startup);
  };

  const uploadToCloudinary = async (file: File, resourceType: "image" | "auto") => {
    const signature = await getPublicCloudinaryUploadSignatureApi({
      folder: "founders-connect/sais26-feedback",
      resourceType,
    });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", String(signature.timestamp));
    formData.append("signature", signature.signature);
    formData.append("folder", signature.folder);
    if (signature.publicId) formData.append("public_id", signature.publicId);

    const uploadRes = await fetch(signature.uploadUrl, { method: "POST", body: formData });
    const uploadData = (await uploadRes.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
    if (!uploadRes.ok || !uploadData.secure_url) {
      throw new Error(uploadData.error?.message || "Upload failed.");
    }
    return uploadData.secure_url;
  };

  const handleFeedbackImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file, "image");
      setFeedbackImageUrl(url);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Image upload failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleVoiceNoteChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !authToken) return;
    setIsUploadingVoice(true);
    try {
      const url = await uploadToCloudinary(file, "auto");
      setVoiceNoteUrl(url);
      setIsUploadingVoice(false);

      setIsTranscribing(true);
      const { text } = await transcribeVoiceNoteApi(authToken, url);
      if (text) {
        setRatingComment((prev) => (prev ? `${prev}\n${text}` : text));
        toast({ title: "Voice note transcribed", description: "Review the text below and edit it if needed." });
      } else {
        toast({
          variant: "destructive",
          title: "Could not transcribe voice note",
          description: "The audio was uploaded — you can still type your feedback manually.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Voice note failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsUploadingVoice(false);
      setIsTranscribing(false);
    }
  };

  const stopMicTracks = () => {
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
  };

  const startRecording = async () => {
    if (!authToken || isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();

      gotLiveTranscriptRef.current = false;
      setLiveCaption("");

      const SpeechRecognitionCtor = getSpeechRecognitionCtor();
      if (SpeechRecognitionCtor) {
        const recognition = new SpeechRecognitionCtor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-IN";
        recognition.onresult = (event: any) => {
          let interim = "";
          let finalChunk = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalChunk += `${transcript} `;
            } else {
              interim += transcript;
            }
          }
          if (finalChunk.trim()) {
            gotLiveTranscriptRef.current = true;
            setRatingComment((prev) => (prev ? `${prev.trim()} ${finalChunk.trim()}` : finalChunk.trim()));
          }
          setLiveCaption(interim);
        };
        recognition.onerror = () => {};
        recognition.start();
        recognitionRef.current = recognition;
      } else {
        toast({
          title: "Live captions not supported",
          description: "Your browser can't show real-time text — we'll transcribe your recording after you stop.",
        });
      }

      setIsRecording(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Microphone access denied",
        description: "Allow microphone access in your browser to record a live voice note.",
      });
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recognitionRef.current?.stop();
    recognitionRef.current = null;

    recorder.onstop = async () => {
      stopMicTracks();
      setIsRecording(false);
      setLiveCaption("");

      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      audioChunksRef.current = [];
      if (blob.size === 0) return;

      setIsUploadingVoice(true);
      try {
        const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: "audio/webm" });
        const url = await uploadToCloudinary(file, "auto");
        setVoiceNoteUrl(url);
        setIsUploadingVoice(false);

        // Live captions already filled ratingComment as the investor spoke — only fall back
        // to server-side Whisper transcription when the browser couldn't do it live.
        if (!gotLiveTranscriptRef.current) {
          setIsTranscribing(true);
          const { text } = await transcribeVoiceNoteApi(authToken as string, url);
          if (text) {
            setRatingComment((prev) => (prev ? `${prev}\n${text}` : text));
          }
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Voice note failed",
          description: error instanceof Error ? error.message : "Please try again.",
        });
      } finally {
        setIsUploadingVoice(false);
        setIsTranscribing(false);
      }
    };
    recorder.stop();
    mediaRecorderRef.current = null;
  };

  // If the dialog is closed or the component unmounts mid-recording, don't leave the mic hot.
  useEffect(() => {
    if (!ratingTargetStartup && isRecording) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current = null;
      stopMicTracks();
      setIsRecording(false);
      setLiveCaption("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratingTargetStartup]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      mediaRecorderRef.current?.stop();
      stopMicTracks();
    };
  }, []);

  const handleRatingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ratingTargetStartup || !authToken) return;

    const hasUnratedCriteria = Object.values(ratingScores).some((score) => score < 1);
    if (hasUnratedCriteria) {
      toast({
        variant: "destructive",
        title: "Rate every criterion",
        description: "Please give at least 1 star on all 5 criteria before submitting.",
      });
      return;
    }

    setIsSubmittingRating(true);
    try {
      await submitRoomRatingApi(authToken, {
        startupId: (ratingTargetStartup as any)._id || ratingTargetStartup.id,
        scores: ratingScores,
        comment: ratingComment,
        feedbackImageUrl,
        voiceNoteUrl,
      });
      toast({
        title: isUpdatingExisting ? "Rating updated!" : "Rating submitted!",
        description: `Your evaluation for ${ratingTargetStartup.startupName} is saved.`,
      });
      setRatingTargetStartup(null);
      setRatingComment("");
      setFeedbackImageUrl("");
      setVoiceNoteUrl("");
      await load();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not submit rating",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const totalScore = RATING_CRITERIA.reduce((sum, c) => sum + (ratingScores[c.key] || 0), 0);

  return (
    <div className="space-y-6">
      {viewerRole === "admin" && (
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 w-fit">
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          Admin oversight view — read-only, not visible to investors or founders.
        </div>
      )}

      <Tabs defaultValue="startups" className="w-full">
        <TabsList>
          <TabsTrigger value="startups">
            <Building2 className="w-4 h-4 mr-1.5" /> Startups ({startups.length})
          </TabsTrigger>
          <TabsTrigger value="investors">
            <Users className="w-4 h-4 mr-1.5" /> Investors ({investors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="startups" className="space-y-4 pt-4">
          {isLoading && startups.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">Loading startups…</p>
          ) : startups.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">No startups registered yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {startups.map((startup, index) => {
                const startupId = (startup as any)._id || startup.id;
                const isTopThree = index < 3;
                const isMine = highlightStartupId && startupId === highlightStartupId;
                const alreadyRated = Boolean(
                  currentAccount?.fullName && startup.ratings?.some((r) => r.investorName === currentAccount.fullName),
                );

                return (
                  <Card
                    key={startupId}
                    className={`border-2 ${isMine ? "border-emerald-400 shadow-lg" : "border-slate-200"}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src={startup.logoUrl}
                              alt={startup.startupName}
                              className="w-14 h-14 rounded-xl object-cover border-2 border-slate-200"
                            />
                            <Badge className="absolute -top-3 -left-3 text-xs bg-slate-800 text-white">
                              {isTopThree ? RANK_BADGES[index] : `#${index + 1}`}
                            </Badge>
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-bold text-slate-900">{startup.startupName}</h3>
                              {isMine && <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">Your Startup</Badge>}
                              {alreadyRated && viewerRole === "investor" && (
                                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs">You Rated This</Badge>
                              )}
                              <Badge variant="outline" className="text-xs">{startup.category}</Badge>
                              <Badge variant="secondary" className="text-xs">{startup.stage}</Badge>
                            </div>
                            <p className="text-sm text-slate-600">{startup.tagline}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            {startup.averageScore > 0 ? startup.averageScore : "N/A"}
                          </div>
                          <span className="text-xs text-slate-500">({startup.totalRatingsCount})</span>
                        </div>

                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                          <Button variant="outline" size="sm" onClick={() => setProfileStartup(startup)} className="flex-1 md:flex-initial text-xs">
                            <Eye className="w-4 h-4 mr-1.5" /> View Profile
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setViewDeckStartup(startup)} className="flex-1 md:flex-initial text-xs">
                            <FileText className="w-4 h-4 mr-1.5" /> Pitch Deck
                          </Button>
                          {viewerRole === "founder" && isMine && founderAccessToken && (
                            <Button asChild size="sm" className="flex-1 md:flex-initial text-xs bg-purple-600 hover:bg-purple-700 text-white">
                              <Link to={`/bangalore-activity?edit=${founderAccessToken}`}>
                                <Pencil className="w-4 h-4 mr-1.5" /> Edit Profile
                              </Link>
                            </Button>
                          )}
                          {viewerRole === "investor" && authToken && (
                            <Button
                              size="sm"
                              onClick={() => openRatingDialog(startup)}
                              className="flex-1 md:flex-initial text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              <Star className="w-4 h-4 mr-1.5 fill-white" /> {alreadyRated ? "Update Rating" : "Rate"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="investors" className="space-y-4 pt-4">
          {investors.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">No investors have joined yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {investors.map((investor) => (
                <Card
                  key={(investor as any)._id || investor.id}
                  onClick={() => setProfileInvestor(investor)}
                  className="border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <CardContent className="p-5 flex items-start gap-3">
                    <img
                      src={investor.photoUrl}
                      alt={investor.fullName}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{investor.fullName}</h4>
                      <p className="text-xs text-slate-600">{investor.designation} · {investor.firmName}</p>
                      {investor.sectors?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {investor.sectors.slice(0, 3).map((sector) => (
                            <Badge key={sector} variant="outline" className="text-[10px]">{sector}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <PitchDeckViewerModal startup={viewDeckStartup} onClose={() => setViewDeckStartup(null)} />
      <StartupProfileModal startup={profileStartup} onClose={() => setProfileStartup(null)} />
      <InvestorProfileModal investor={profileInvestor} onClose={() => setProfileInvestor(null)} />

      {ratingTargetStartup && (
        <Dialog open={!!ratingTargetStartup} onOpenChange={() => setRatingTargetStartup(null)}>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto bg-white p-4 sm:p-6 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                {isUpdatingExisting ? "Update Rating" : "Rate"}: {ratingTargetStartup.startupName}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600">
                {isUpdatingExisting
                  ? "You've already rated this startup — adjust and resubmit to update it."
                  : `Score across the ${RATING_CRITERIA.length} evaluation criteria, 1 to ${RATING_SCALE_MAX} each.`}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRatingSubmit} className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {Object.values(ratingScores).filter((v) => v > 0).length} / {RATING_CRITERIA.length} criteria rated
                </span>
                <div className="flex gap-1">
                  {RATING_CRITERIA.map((c) => (
                    <span
                      key={c.key}
                      className="h-1.5 w-5 rounded-full transition-colors duration-300"
                      style={{ background: ratingScores[c.key] > 0 ? c.color : "#e2e8f0" }}
                    />
                  ))}
                </div>
              </div>

              {RATING_CRITERIA.map((criteria) => {
                const currentVal = ratingScores[criteria.key];
                const previewVal = hoverPreview?.key === criteria.key ? hoverPreview.star : currentVal;
                const Icon = criteria.icon;
                return (
                  <div
                    key={criteria.key}
                    className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 pl-4 space-y-2 transition-shadow hover:shadow-sm"
                  >
                    <span className="absolute left-0 top-0 h-full w-1" style={{ background: criteria.color }} />
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: criteria.color }} />
                        {criteria.label}
                      </span>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[11px] font-bold"
                        style={
                          currentVal > 0
                            ? { borderColor: `${criteria.color}55`, background: `${criteria.color}15`, color: criteria.color }
                            : { borderColor: "#e2e8f0", color: "#94a3b8" }
                        }
                      >
                        {currentVal > 0 ? `${currentVal} / ${RATING_SCALE_MAX} · ${ratingScoreLabel(currentVal)}` : "Not rated yet"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-1" onMouseLeave={() => setHoverPreview(null)}>
                      {SCORE_VALUES.map((val) => (
                        <motion.button
                          key={val}
                          type="button"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onMouseEnter={() => setHoverPreview({ key: criteria.key, star: val })}
                          onClick={() => setRatingScores({ ...ratingScores, [criteria.key]: val })}
                          className="flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold transition-colors duration-150"
                          style={
                            val <= previewVal
                              ? { background: criteria.color, borderColor: criteria.color, color: "#fff" }
                              : { background: "#fff", borderColor: "#cbd5e1", color: "#64748b" }
                          }
                        >
                          {val}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <Textarea
                placeholder="Feedback for the founder (optional) — write it here, or attach a photo of your notes / a voice note below"
                rows={2}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
              />

              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  {isUploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
                  {feedbackImageUrl ? "Replace photo" : "Attach photo of notes"}
                  <input type="file" accept="image/*" className="hidden" disabled={isUploadingImage} onChange={handleFeedbackImageChange} />
                </label>

                {!isRecording ? (
                  <button
                    type="button"
                    onClick={() => void startRecording()}
                    disabled={isUploadingVoice || isTranscribing}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mic className="h-3.5 w-3.5 text-rose-500" /> Record live voice note
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
                    </span>
                    Stop recording
                  </button>
                )}

                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  {isUploadingVoice ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
                  {voiceNoteUrl ? "Replace voice note" : "Upload voice note"}
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    disabled={isUploadingVoice || isTranscribing || isRecording}
                    onChange={handleVoiceNoteChange}
                  />
                </label>

                {isTranscribing && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Transcribing voice note…
                  </span>
                )}
              </div>

              {isRecording && (
                <div className="rounded-lg border border-rose-200 bg-rose-50/70 p-2.5 text-xs text-slate-700">
                  <span className="font-semibold text-rose-600">Listening… </span>
                  <span className="italic text-slate-500">
                    {liveCaption || "Start speaking — your words will appear here in real time."}
                  </span>
                </div>
              )}

              {feedbackImageUrl && (
                <div className="relative inline-block">
                  <img src={feedbackImageUrl} alt="Feedback notes" className="h-24 w-24 rounded-lg border border-slate-200 object-cover" />
                  <button
                    type="button"
                    onClick={() => setFeedbackImageUrl("")}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-white shadow"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {voiceNoteUrl && (
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
                  <audio src={voiceNoteUrl} controls className="h-8 flex-1" />
                  <button
                    type="button"
                    onClick={() => setVoiceNoteUrl("")}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Total Score</span>
                  <span className="text-base font-extrabold" style={{ color: scoreMeterColor((totalScore / RATING_MAX_TOTAL) * 100) }}>
                    {totalScore} / {RATING_MAX_TOTAL} ({(totalScore / RATING_CRITERIA.length).toFixed(1)} avg)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    className="h-full rounded-full"
                    initial={false}
                    animate={{ width: `${(totalScore / RATING_MAX_TOTAL) * 100}%`, background: scoreMeterColor((totalScore / RATING_MAX_TOTAL) * 100) }}
                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={
                  isSubmittingRating ||
                  isUploadingImage ||
                  isUploadingVoice ||
                  isTranscribing ||
                  isRecording ||
                  Object.values(ratingScores).some((score) => score < 1)
                }
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingRating ? "Submitting…" : isUpdatingExisting ? "Update Rating" : "Submit Rating"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Sais26Room;
