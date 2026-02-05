package in.main.service;

import java.util.Locale;

// Minimal placeholder classes to allow compilation when javax.speech is not present.
// These are only placeholders for compile-time — real speech implementations should replace them.
class EngineModeDesc {
    public EngineModeDesc(Locale locale) { }
}

class Central {
    public static Recognizer createRecognizer(EngineModeDesc desc) {
        return null; // no-op placeholder
    }
}

interface Recognizer {
    void allocate() throws Exception;
    void deallocate() throws Exception;
    void requestFocus() throws Exception;
    void resume() throws Exception;
    void pause() throws Exception;
    RuleGrammar newRuleGrammar(String name);
    void addGrammar(RuleGrammar grammar);
    void addResultListener(ResultAdapter adapter);
}

interface RuleGrammar {
    void setRule(String name, Object rule, boolean flag);
    Object ruleForJSGF(String rules);
}

class ResultAdapter {
    public void resultAccepted(ResultEvent e) { }
}

class ResultEvent {
    private final Object source;
    public ResultEvent(Object source) { this.source = source; }
    public Object getSource() { return source; }
}

class Result {
    public Token getBestToken(int i) { return new Token(); }
}

class Token {
    public String getSpokenText() { return ""; }
}
