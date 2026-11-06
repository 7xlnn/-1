export interface ClientProfile {
    id: string;
    name: string;
    gender: '男' | '女';
    age: number;
    occupation: string;
    chiefComplaint: string;
    background: string;
    situations: string[];
    automaticThoughts: string[];
    emotions: string[];
    behaviors: string[];
    childhood: string;
    coreBeliefs: string[];
    attitudes: string[];
    rules: string[];
    assumptions: string[];
    speechStyle: string;
    tags: string[];
}
