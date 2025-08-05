import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Unlock, Key, Shield, Zap, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DecryptPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    encryptedMessage: "",
    caesarShift: 3,
    vigenereKey: "",
    aesKey: ""
  });
  const [decryptedResult, setDecryptedResult] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionTime, setDecryptionTime] = useState(0);
  const [isValidDecryption, setIsValidDecryption] = useState(true);

  const handleDecrypt = async () => {
  console.log("[DecryptPage] Decrypt button clicked");
  setIsDecrypting(true);
  const startTime = Date.now();

  try {
    console.log("[DecryptPage] Sending API request to backend...");

    const response = await fetch("http://127.0.0.1:5000/decrypt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        encrypted_message: formData.encryptedMessage,
        caesar_shift: formData.caesarShift,
        vigenere_key: formData.vigenereKey,
        aes_key: formData.aesKey
      })
    });

    if (!response.ok) {
      throw new Error("API response was not ok");
    }

    const data = await response.json();
    console.log("[DecryptPage] API response received: ", data);

    setDecryptedResult(data.decrypted_message);
    setIsValidDecryption(true);
  } catch (error) {
    console.error("[DecryptPage] Error during decryption:", error);
    setDecryptedResult("Decryption failed. Please check your keys and try again.");
    setIsValidDecryption(false);
  }

  setDecryptionTime(Date.now() - startTime);
  setIsDecrypting(false);
  setStep(4);
};


  const copyToClipboard = () => {
    navigator.clipboard.writeText(decryptedResult);
    toast({
      title: "Copied to clipboard",
      description: "Decrypted message has been copied to your clipboard."
    });
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      encryptedMessage: "",
      caesarShift: 3,
      vigenereKey: "",
      aesKey: ""
    });
    setDecryptedResult("");
    setDecryptionTime(0);
    setIsValidDecryption(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Decrypt Message</h1>
          <p className="text-muted-foreground">Unlock your encrypted message with the correct keys</p>
        </div>
        <div className="flex items-center space-x-2">
          <Unlock className="w-6 h-6 text-primary" />
          <span className="text-sm text-muted-foreground">Reverse Engineering</span>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="glass-card border-navy-light">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-foreground">Decryption Progress</span>
            <span className="text-sm text-muted-foreground">Step {step} of 4</span>
          </div>
          <Progress value={(step / 4) * 100} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Input</span>
            <span>Keys</span>
            <span>Process</span>
            <span>Complete</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Step 1: Encrypted Message Input */}
          <Card className={`glass-card border-navy-light ${step >= 1 ? 'neon-glow' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step > 1 ? 'bg-primary text-primary-foreground' : 'bg-navy-light text-foreground'
                }`}>
                  {step > 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
                </div>
                <span>Encrypted Message</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="encryptedMessage" className="text-foreground font-medium">
                  Paste your encrypted message
                </Label>
                <Textarea
                  id="encryptedMessage"
                  placeholder="Paste the encrypted message here..."
                  value={formData.encryptedMessage}
                  onChange={(e) => setFormData(prev => ({ ...prev, encryptedMessage: e.target.value }))}
                  className="mt-2 glass-card border-navy-light focus:border-primary min-h-[120px] resize-none font-mono text-sm"
                  disabled={step > 1}
                />
              </div>
              {step === 1 && (
                <Button 
                  onClick={() => setStep(2)}
                  disabled={!formData.encryptedMessage.trim()}
                  className="w-full gradient-primary text-white hover-lift"
                >
                  Continue to Decryption Keys
                  <Key className="ml-2 w-4 h-4" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Caesar Cipher Key */}
          {step >= 2 && (
            <Card className={`glass-card border-navy-light ${step === 2 ? 'neon-glow' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step > 2 ? 'bg-primary text-primary-foreground' : 'bg-navy-light text-foreground'
                  }`}>
                    {step > 2 ? <CheckCircle className="w-4 h-4" /> : "2"}
                  </div>
                  <span>Caesar Cipher Key</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="caesarShift" className="text-foreground font-medium">
                    Caesar Shift Value (1-25)
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
                    Enter the same shift value used during encryption
                  </p>
                </div>
                {step === 2 && (
                  <Button 
                    onClick={() => setStep(3)}
                    className="w-full gradient-primary text-white hover-lift"
                  >
                    Continue to Advanced Keys
                    <Shield className="ml-2 w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Advanced Keys */}
          {step >= 3 && (
            <Card className={`glass-card border-navy-light ${step === 3 ? 'neon-glow' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step > 3 ? 'bg-primary text-primary-foreground' : 'bg-navy-light text-foreground'
                  }`}>
                    {step > 3 ? <CheckCircle className="w-4 h-4" /> : "3"}
                  </div>
                  <span>Vigenère & AES Keys</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vigenereKey" className="text-foreground font-medium">
                    Vigenère Keyword
                  </Label>
                  <Input
                    id="vigenereKey"
                    placeholder="Enter the exact keyword used for encryption"
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
                    placeholder="Enter the exact AES key used for encryption"
                    value={formData.aesKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, aesKey: e.target.value }))}
                    className="mt-2 glass-card border-navy-light focus:border-primary"
                    disabled={step > 3}
                  />
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Security Notice</span>
                  </div>
                  <p className="text-xs text-amber-300 mt-1">
                    All keys must match exactly those used during encryption for successful decryption.
                  </p>
                </div>
                {step === 3 && (
                  <Button 
                    onClick={handleDecrypt}
                    disabled={!formData.vigenereKey || !formData.aesKey || isDecrypting}
                    className="w-full gradient-primary text-white hover-lift"
                  >
                    {isDecrypting ? (
                      <>
                        <div className="encrypt-loading mr-2">Decrypting...</div>
                        <Zap className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Decrypt Message
                        <Unlock className="ml-2 w-4 h-4" />
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
          {/* Decryption Result */}
          {step === 4 && (
            <Card className={`glass-card border-navy-light ${isValidDecryption ? 'neon-glow' : 'border-red-500/50'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isValidDecryption ? 'text-primary' : 'text-red-400'}`}>
                  {isValidDecryption ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                  <span>{isValidDecryption ? 'Decryption Complete' : 'Decryption Failed'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-foreground font-medium">Decrypted Message</Label>
                  <Textarea
                    value={decryptedResult}
                    readOnly
                    className={`mt-2 glass-card border-navy-light ${isValidDecryption ? '' : 'text-red-400'}`}
                    rows={8}
                  />
                </div>
                {isValidDecryption && (
                  <div className="flex space-x-2">
                    <Button 
                      onClick={copyToClipboard}
                      variant="outline" 
                      className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                )}
                <Button 
                  onClick={resetForm}
                  className="w-full gradient-primary text-white hover-lift"
                >
                  Decrypt Another Message
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Decryption Metrics */}
          {step === 4 && isValidDecryption && (
            <Card className="glass-card border-navy-light">
              <CardHeader>
                <CardTitle className="text-foreground">Decryption Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold neon-text">{decryptionTime}ms</div>
                    <div className="text-sm text-muted-foreground">Processing Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold neon-text">100%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-navy-light">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Algorithms Reversed:</span>
                      <span className="text-foreground">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verification:</span>
                      <span className="text-primary font-medium">Successful</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Integrity:</span>
                      <span className="text-primary font-medium">Verified</span>
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