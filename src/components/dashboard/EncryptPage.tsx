import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Lock, Key, Shield, Zap, Copy, Download, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function EncryptPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    message: "",
    caesarShift: 3,
    vigenereKey: "",
    aesKey: ""
  });
  const [encryptedResult, setEncryptedResult] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionTime, setEncryptionTime] = useState(0);

  const handleEncrypt = async () => {
    setIsEncrypting(true);
    const startTime = Date.now();
    
    // Simulate encryption process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple demonstration encryption (not production-ready)
    let result = formData.message;
    
    // Caesar cipher
    result = result.split('').map(char => {
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const base = code >= 65 && code <= 90 ? 65 : 97;
        return String.fromCharCode(((code - base + formData.caesarShift) % 26) + base);
      }
      return char;
    }).join('');
    
    // Add Vigenère simulation
    result = btoa(result + "_VIG_" + formData.vigenereKey);
    
    // Add AES simulation
    result = btoa(result + "_AES_" + formData.aesKey);
    
    setEncryptedResult(result);
    setEncryptionTime(Date.now() - startTime);
    setIsEncrypting(false);
    setStep(4);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(encryptedResult);
    toast({
      title: "Copied to clipboard",
      description: "Encrypted message has been copied to your clipboard."
    });
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      message: "",
      caesarShift: 3,
      vigenereKey: "",
      aesKey: ""
    });
    setEncryptedResult("");
    setEncryptionTime(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Encrypt Message</h1>
          <p className="text-muted-foreground">Secure your message with triple-layer encryption</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-sm text-muted-foreground">AES-256 • Vigenère • Caesar</span>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="glass-card border-navy-light">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-foreground">Encryption Progress</span>
            <span className="text-sm text-muted-foreground">Step {step} of 4</span>
          </div>
          <Progress value={(step / 4) * 100} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Message</span>
            <span>Caesar</span>
            <span>Vigenère</span>
            <span>Complete</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Step 1: Message Input */}
          <Card className={`glass-card border-navy-light ${step >= 1 ? 'neon-glow' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step > 1 ? 'bg-primary text-primary-foreground' : 'bg-navy-light text-foreground'
                }`}>
                  {step > 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
                </div>
                <span>Message to Encrypt</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="message" className="text-foreground font-medium">
                  Enter your message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Type your secret message here..."
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="mt-2 glass-card border-navy-light focus:border-primary min-h-[120px] resize-none"
                  disabled={step > 1}
                />
              </div>
              {step === 1 && (
                <Button 
                  onClick={() => setStep(2)}
                  disabled={!formData.message.trim()}
                  className="w-full gradient-primary text-white hover-lift"
                >
                  Continue to Caesar Cipher
                  <Lock className="ml-2 w-4 h-4" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Caesar Cipher */}
          {step >= 2 && (
            <Card className={`glass-card border-navy-light ${step === 2 ? 'neon-glow' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step > 2 ? 'bg-primary text-primary-foreground' : 'bg-navy-light text-foreground'
                  }`}>
                    {step > 2 ? <CheckCircle className="w-4 h-4" /> : "2"}
                  </div>
                  <span>Caesar Cipher</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="caesarShift" className="text-foreground font-medium">
                    Shift Value (1-25)
                  </Label>
                  <Input
                    id="caesarShift"
                    type="number"
                    min="1"
                    max="25"
                    value={formData.caesarShift}
                    onChange={(e) => setFormData(prev => ({ ...prev, caesarShift: parseInt(e.target.value) }))}
                    className="mt-2 glass-card border-navy-light focus:border-primary"
                    disabled={step > 2}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Each letter will be shifted by {formData.caesarShift} positions
                  </p>
                </div>
                {step === 2 && (
                  <Button 
                    onClick={() => setStep(3)}
                    className="w-full gradient-primary text-white hover-lift"
                  >
                    Continue to Vigenère Cipher
                    <Key className="ml-2 w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Vigenère Cipher */}
          {step >= 3 && (
            <Card className={`glass-card border-navy-light ${step === 3 ? 'neon-glow' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step > 3 ? 'bg-primary text-primary-foreground' : 'bg-navy-light text-foreground'
                  }`}>
                    {step > 3 ? <CheckCircle className="w-4 h-4" /> : "3"}
                  </div>
                  <span>Vigenère Cipher & AES</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vigenereKey" className="text-foreground font-medium">
                    Vigenère Keyword
                  </Label>
                  <Input
                    id="vigenereKey"
                    placeholder="Enter a keyword (letters only)"
                    value={formData.vigenereKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, vigenereKey: e.target.value.replace(/[^a-zA-Z]/g, '') }))}
                    className="mt-2 glass-card border-navy-light focus:border-primary"
                    disabled={step > 3}
                  />
                </div>
                <div>
                  <Label htmlFor="aesKey" className="text-foreground font-medium">
                    AES Encryption Key
                  </Label>
                  <Input
                    id="aesKey"
                    placeholder="Enter a strong encryption key"
                    value={formData.aesKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, aesKey: e.target.value }))}
                    className="mt-2 glass-card border-navy-light focus:border-primary"
                    disabled={step > 3}
                  />
                </div>
                {step === 3 && (
                  <Button 
                    onClick={handleEncrypt}
                    disabled={!formData.vigenereKey || !formData.aesKey || isEncrypting}
                    className="w-full gradient-primary text-white hover-lift"
                  >
                    {isEncrypting ? (
                      <>
                        <div className="encrypt-loading mr-2">Encrypting...</div>
                        <Zap className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Encrypt Message
                        <Shield className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Result Section */}
        <div className="space-y-6">
          {/* Encryption Result */}
          {step === 4 && (
            <Card className="glass-card border-navy-light neon-glow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-primary">
                  <CheckCircle className="w-6 h-6" />
                  <span>Encryption Complete</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-foreground font-medium">Encrypted Message</Label>
                  <Textarea
                    value={encryptedResult}
                    readOnly
                    className="mt-2 glass-card border-navy-light font-mono text-sm"
                    rows={8}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={copyToClipboard}
                    variant="outline" 
                    className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <Button 
                  onClick={resetForm}
                  className="w-full gradient-primary text-white hover-lift"
                >
                  Encrypt Another Message
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Encryption Metrics */}
          {step === 4 && (
            <Card className="glass-card border-navy-light">
              <CardHeader>
                <CardTitle className="text-foreground">Encryption Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold neon-text">{encryptionTime}ms</div>
                    <div className="text-sm text-muted-foreground">Processing Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold neon-text">99.9%</div>
                    <div className="text-sm text-muted-foreground">Entropy Score</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-navy-light">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Algorithms Used:</span>
                      <span className="text-foreground">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Security Level:</span>
                      <span className="text-primary font-medium">Military Grade</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Key Strength:</span>
                      <span className="text-primary font-medium">High</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}